import { VertexAI } from "@google-cloud/vertexai";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const PROJECT_ID = process.env.GCP_PROJECT_ID || "gen-lang-client-0316098340";
const LOCATION = "us-central1";
const MODEL_ID = "gemini-1.5-pro";

let vertexAI: VertexAI | null = null;
let credentialsConfigured = false;

function findCredentialsFile(): string | null {
  const possiblePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    "./google-credentials.json",
    "./script/google-credentials.json",
    "/home/runner/workspace/google-credentials.json",
    "/home/runner/workspace/script/google-credentials.json",
  ].filter(Boolean) as string[];

  for (const filePath of possiblePaths) {
    try {
      const resolvedPath = path.resolve(filePath);
      if (fs.existsSync(resolvedPath)) {
        console.log(`[Vertex AI] Found credentials at: ${resolvedPath}`);
        return resolvedPath;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

function setupCredentials(): boolean {
  if (credentialsConfigured) return true;
  
  const credPath = findCredentialsFile();
  if (credPath) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    credentialsConfigured = true;
    console.log(`[Vertex AI] Credentials configured: ${credPath}`);
    return true;
  }
  
  console.log("[Vertex AI] No credentials file found");
  return false;
}

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    setupCredentials();
    vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });
  }
  return vertexAI;
}

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

export async function extractQuoteWithVertexAI(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ExtractedQuote> {
  const vertex = getVertexAI();
  const generativeModel = vertex.getGenerativeModel({
    model: MODEL_ID,
  });

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
    const isExcel = mimeType.includes("spreadsheet") || 
                    mimeType.includes("excel") || 
                    fileName.endsWith(".xlsx") || 
                    fileName.endsWith(".xls");
    const isCsv = mimeType === "text/csv" || fileName.endsWith(".csv");
    
    let request;
    
    if (isExcel) {
      const textContent = excelToText(fileBuffer);
      request = {
        contents: [{
          role: "user" as const,
          parts: [{ text: `${prompt}\n\nConteúdo do arquivo Excel:\n${textContent}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      };
    } else if (isCsv) {
      const textContent = fileBuffer.toString("utf-8");
      request = {
        contents: [{
          role: "user" as const,
          parts: [{ text: `${prompt}\n\nConteúdo do arquivo CSV:\n${textContent}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      };
    } else {
      request = {
        contents: [{
          role: "user" as const,
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBuffer.toString("base64"),
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      };
    }

    console.log(`[Vertex AI] Processing ${fileName} with ${MODEL_ID}...`);
    const result = await generativeModel.generateContent(request);
    const response = result.response;
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Vertex AI");
    }

    const text = response.candidates[0].content.parts[0].text || "";
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const extracted: ExtractedQuote = JSON.parse(cleanText);
    
    if (!extracted.fornecedor || !Array.isArray(extracted.items)) {
      throw new Error("Invalid response structure from Vertex AI");
    }

    console.log(`[Vertex AI] Successfully extracted ${extracted.items.length} items from ${fileName}`);
    return extracted;
  } catch (error) {
    console.error("[Vertex AI] Error extracting quote:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`[Vertex AI] Failed to extract quote from ${fileName}: ${errorMessage}`);
  }
}

export function isVertexAIConfigured(): boolean {
  return findCredentialsFile() !== null;
}
