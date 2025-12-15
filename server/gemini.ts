import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_LP_ZENO || process.env.GEMINI_API;
    if (!apiKey) {
      throw new Error("GEMINI_LP_ZENO or GEMINI_API environment variable is required. Please add it to your secrets.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface ExtractedItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
}

export interface ExtractedQuote {
  fornecedor: string;
  items: ExtractedItem[];
}

export async function extractQuoteFromFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedQuote> {
  // Use gemini-1.5-flash-latest or gemini-pro-vision for better compatibility
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Você é um assistente especializado em extrair dados de cotações e orçamentos de fornecedores.

Analise este arquivo (${fileName}) e extraia as seguintes informações em formato JSON:

{
  "fornecedor": "Nome do Fornecedor (extraído do documento ou use o nome do arquivo se não encontrar)",
  "items": [
    {
      "descricao": "Descrição completa do item/produto",
      "quantidade": número (apenas o valor numérico),
      "unidade": "unidade de medida (un, kg, m, par, etc)",
      "precoUnitario": número (apenas o valor numérico, sem R$ ou símbolos)
    }
  ]
}

REGRAS IMPORTANTES:
1. Extraia TODOS os itens da cotação
2. Ignore cabeçalhos, rodapés, termos e condições
3. Para quantidade e preço, use apenas números (converta vírgulas para pontos decimais)
4. Se não encontrar o nome do fornecedor no documento, use o nome do arquivo sem a extensão
5. Mantenha as descrições completas e claras
6. Retorne APENAS o JSON válido, sem explicações adicionais`;

  try {
    const imagePart = {
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean JSON from markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const extracted: ExtractedQuote = JSON.parse(cleanText);
    
    // Validate structure
    if (!extracted.fornecedor || !Array.isArray(extracted.items)) {
      throw new Error("Invalid response structure from Gemini");
    }

    return extracted;
  } catch (error) {
    console.error("Error extracting quote with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract quote from ${fileName}: ${errorMessage}`);
  }
}
