import { GoogleGenerativeAI } from "@google/generative-ai";
import * as XLSX from "xlsx";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

let genAI: GoogleGenerativeAI | null = null;

function excelToText(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  let text = "";
  
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    text += `=== ${sheetName} ===\n${csv}\n\n`;
  }
  
  return text;
}

async function pdfToText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return "";
  }
}

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_LP_ZENO || process.env.GEMINI_API;
    if (!apiKey) {
      throw new Error("GEMINI_LP_ZENO or GEMINI_API environment variable is required. Please add it to your secrets.");
    }
    console.log(`Using Gemini API key starting with: ${apiKey.substring(0, 8)}...`);
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
  // Use gemini-2.0-flash-lite for better quota limits
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
    let result;
    
    // Detect file types
    const isExcel = mimeType.includes("spreadsheet") || 
                    mimeType.includes("excel") || 
                    fileName.endsWith(".xlsx") || 
                    fileName.endsWith(".xls");
    const isCsv = mimeType === "text/csv" || fileName.endsWith(".csv");
    const isPdf = mimeType === "application/pdf" || fileName.endsWith(".pdf");
    const isImage = mimeType.startsWith("image/");
    
    if (isExcel) {
      // Convert Excel to text
      const textContent = excelToText(fileBuffer);
      const textPrompt = `${prompt}\n\nConteúdo do arquivo Excel:\n${textContent}`;
      result = await model.generateContent(textPrompt);
    } else if (isCsv) {
      // Send CSV as text
      const textContent = fileBuffer.toString("utf-8");
      const textPrompt = `${prompt}\n\nConteúdo do arquivo CSV:\n${textContent}`;
      result = await model.generateContent(textPrompt);
    } else if (isPdf) {
      // Convert PDF to text
      const textContent = await pdfToText(fileBuffer);
      if (textContent.trim()) {
        const textPrompt = `${prompt}\n\nConteúdo do arquivo PDF:\n${textContent}`;
        result = await model.generateContent(textPrompt);
      } else {
        // PDF has no extractable text (scanned image) - send as binary
        const imagePart = {
          inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType: mimeType,
          },
        };
        result = await model.generateContent([prompt, imagePart]);
      }
    } else if (isImage) {
      // Images must be sent as binary
      const imagePart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType,
        },
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      // Unknown format - try as text first
      const textContent = fileBuffer.toString("utf-8");
      const textPrompt = `${prompt}\n\nConteúdo do arquivo:\n${textContent}`;
      result = await model.generateContent(textPrompt);
    }

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
