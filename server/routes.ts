import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { extractQuoteFromFile } from "./gemini";
import { extractQuoteWithVertexAI, isVertexAIConfigured } from "./vertexai";
import { insertLeadSchema, insertAppConfigSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

interface Item {
  id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
}

interface PrecoItem {
  itemId: string;
  precoUnitario: number;
  precoTotal: number;
}

interface Fornecedor {
  id: string;
  nome: string;
  precos: PrecoItem[];
  total: number;
  subtotal: number;
  impostos: number;
  fileName: string;
  isManual?: boolean;
  extractionError?: string;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // POST /api/process-quotes - Process uploaded files with Gemini
  app.post("/api/process-quotes", upload.array("files", 3), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (files.length > 3) {
        return res.status(400).json({ error: "Maximum 3 files allowed" });
      }

      // Check if Vertex AI is configured (service account credentials)
      const useVertexAI = isVertexAIConfigured();
      if (useVertexAI) {
        console.log("[API] Using Vertex AI (Gemini 2.0 Flash) - parallel processing enabled");
      } else {
        console.log("[API] Using Gemini API (Flash Lite) - sequential processing");
      }

      let results: PromiseSettledResult<Awaited<ReturnType<typeof extractQuoteFromFile>>>[];
      
      if (useVertexAI) {
        // Vertex AI: Process all files in PARALLEL for maximum speed
        const startTime = Date.now();
        results = await Promise.allSettled(
          files.map(file => 
            extractQuoteWithVertexAI(file.buffer, file.mimetype, file.originalname)
          )
        );
        console.log(`[API] Parallel processing completed in ${Date.now() - startTime}ms`);
      } else {
        // Fallback Gemini API: Process sequentially with delays to avoid rate limiting
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        results = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const quote = await extractQuoteFromFile(file.buffer, file.mimetype, file.originalname);
            results.push({ status: 'fulfilled', value: quote });
          } catch (error) {
            results.push({ status: 'rejected', reason: error });
          }
          if (i < files.length - 1) {
            await delay(1000);
          }
        }
      }

      // Separate successful extractions and failures
      const extractedQuotes: { quote: Awaited<ReturnType<typeof extractQuoteFromFile>> | null; file: Express.Multer.File; error?: string }[] = 
        results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return { quote: result.value, file: files[index] };
          } else {
            console.warn(`Failed to extract from ${files[index].originalname}:`, result.reason);
            return { quote: null, file: files[index], error: result.reason?.message || 'Erro ao processar' };
          }
        });

      // Build unified item list (merge all unique items across successful quotes)
      const itemsMap = new Map<string, Item>();
      extractedQuotes.forEach(({ quote }) => {
        if (quote) {
          quote.items.forEach(item => {
            const key = item.descricao.toLowerCase().trim();
            if (!itemsMap.has(key)) {
              itemsMap.set(key, {
                id: `item-${itemsMap.size + 1}`,
                descricao: item.descricao,
                quantidade: item.quantidade || 1,
                unidade: item.unidade || 'un',
              });
            }
          });
        }
      });

      const items = Array.from(itemsMap.values());

      // Build fornecedores structure
      const fornecedores: Fornecedor[] = extractedQuotes.map(({ quote, file, error }, index) => {
        // If extraction failed, create empty fornecedor for manual entry
        if (!quote) {
          const emptyPrecos: PrecoItem[] = items.map(item => ({
            itemId: item.id,
            precoUnitario: 0,
            precoTotal: 0,
          }));

          const fileNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
          
          return {
            id: `forn-${index}`,
            nome: fileNameWithoutExt,
            precos: emptyPrecos,
            subtotal: 0,
            impostos: 0,
            total: 0,
            fileName: file.originalname,
            isManual: true,
            extractionError: error,
          };
        }

        const precos: PrecoItem[] = [];

        items.forEach(item => {
          // Find matching item in this quote
          const matchingItem = quote.items.find(
            qi => qi.descricao.toLowerCase().trim() === item.descricao.toLowerCase().trim()
          );

          if (matchingItem) {
            precos.push({
              itemId: item.id,
              precoUnitario: matchingItem.precoUnitario,
              precoTotal: matchingItem.precoUnitario * item.quantidade,
            });
          } else {
            // Item not present in this quote - leave as 0 for manual entry
            precos.push({
              itemId: item.id,
              precoUnitario: 0,
              precoTotal: 0,
            });
          }
        });

        const subtotal = precos.reduce((sum, p) => sum + p.precoTotal, 0);
        const impostos = subtotal * 0.1; // 10% mock tax

        return {
          id: `forn-${index}`,
          nome: quote.fornecedor,
          precos,
          subtotal,
          impostos,
          total: subtotal + impostos,
          fileName: file.originalname,
        };
      });

      res.json({
        items,
        fornecedores,
      });

    } catch (error) {
      console.error("Error processing quotes:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ error: `Failed to process quotes: ${errorMessage}` });
    }
  });

  // POST /api/leads - Save lead and equalization
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body.lead);
      const { fornecedores, items, totalSavings } = req.body;

      // Create lead
      const lead = await storage.createLead(leadData);

      // Create equalization record
      await storage.createEqualization({
        leadId: lead.id,
        fornecedores,
        items,
        totalSavings,
      });

      res.json({ success: true, leadId: lead.id });
    } catch (error) {
      console.error("Error saving lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  // GET /api/leads - Get all leads (admin)
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // GET /api/config - Get app configuration
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getAppConfig();
      res.json(config || {
        dailyLimit: 5,
        sessionLimit: 3,
        trialDays: 7,
        enableLimits: true,
      });
    } catch (error) {
      console.error("Error fetching config:", error);
      res.status(500).json({ error: "Failed to fetch config" });
    }
  });

  // POST /api/generate-diagnostic - Generate AI-powered diagnostic from quiz answers
  app.post("/api/generate-diagnostic", async (req, res) => {
    try {
      const { answers, score } = req.body;
      
      if (!answers || typeof score !== 'number') {
        return res.status(400).json({ error: "Missing answers or score" });
      }

      // Check if Vertex AI is configured
      const useVertexAI = isVertexAIConfigured();
      if (!useVertexAI) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      // Import Vertex AI for diagnostic generation
      const { VertexAI } = await import("@google-cloud/vertexai");
      const fs = await import("fs");
      const path = await import("path");
      
      // Find credentials
      const possiblePaths = [
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        "./google-credentials.json",
        "./script/google-credentials.json",
      ].filter(Boolean) as string[];
      
      let credPath = null;
      for (const p of possiblePaths) {
        const resolved = path.resolve(p);
        if (fs.existsSync(resolved)) {
          credPath = resolved;
          break;
        }
      }
      
      if (credPath) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
      }

      const PROJECT_ID = process.env.GCP_PROJECT_ID || "gen-lang-client-0316098340";
      const vertexAI = new VertexAI({ project: PROJECT_ID, location: "us-central1" });
      const model = vertexAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Build context from answers
      const answerLabels: Record<string, Record<string, string>> = {
        faturamento: { 'ate50k': 'Até R$ 50 mil', '50k-100k': 'R$ 50 mil a R$ 100 mil', '100k-200k': 'R$ 100 mil a R$ 200 mil', '200k-500k': 'R$ 200 mil a R$ 500 mil', '500k-1m': 'R$ 500 mil a R$ 1 milhão', 'acima1m': 'Acima de R$ 1 milhão' },
        compras: { 'ate20k': 'Até R$ 20 mil', '20k-40k': 'R$ 20 mil a R$ 40 mil', '40k-70k': 'R$ 40 mil a R$ 70 mil', 'acima70k': 'Acima de R$ 70 mil', 'naosei': 'Não sei informar' },
        margem: { 'ate5': 'Até 5%', '5-10': '5% a 10%', '10-15': '10% a 15%', 'acima15': 'Acima de 15%', 'naosei': 'Não sei informar' },
        solicitacao: { 'whatsapp': 'WhatsApp / verbal', 'email': 'E-mail', 'planilha': 'Planilha', 'sistema': 'Sistema' },
        fornecedores: { '1': 'Apenas 1', '2': '2 fornecedores', '3+': '3 ou mais', 'depende': 'Depende da urgência' },
        comparacao: { 'olhometro': 'No "olhômetro"', 'manual': 'Comparação manual', 'preco_final': 'Só preço final', 'sistema': 'Uso algum sistema' },
        controle: { 'sei': 'Sei exatamente quanto economizo', 'nocao': 'Tenho uma noção', 'naosei': 'Não sei informar', 'nunca': 'Nunca medi' },
        urgencia: { 'frequente': 'Acontece com frequência', 'as_vezes': 'Às vezes', 'raramente': 'Raramente', 'nunca': 'Nunca' },
        caixa: { 'apertado': 'Sempre apertado', 'justo': 'Controlado, mas justo', 'estavel': 'Estável', 'confortavel': 'Confortável' },
        desejo: { 'tranquilidade': 'Mais tranquilidade no dia a dia', 'investir': 'Investir na empresa', 'retirada': 'Melhorar retirada mensal', 'vendas': 'Facilitar vendas (preço / prazo)' }
      };

      const answersText = Object.entries(answers).map(([key, value]) => {
        const valueStr = value as string;
        if (valueStr.includes(',')) {
          const labels = valueStr.split(',').map(v => answerLabels[key]?.[v] || v).join(', ');
          return `- ${key}: ${labels}`;
        }
        const label = answerLabels[key]?.[valueStr] || valueStr;
        return `- ${key}: ${label}`;
      }).join('\n');

      // Calculate potential savings for context
      let baseValue = 30000;
      const comprasAnswer = answers['compras'];
      if (comprasAnswer === 'ate20k') baseValue = 15000;
      else if (comprasAnswer === '20k-40k') baseValue = 30000;
      else if (comprasAnswer === '40k-70k') baseValue = 55000;
      else if (comprasAnswer === 'acima70k') baseValue = 85000;
      
      const savingsRate = Math.min(0.08 + (score / 100), 0.15);
      const monthlySavings = Math.round(baseValue * savingsRate);
      const annualSavings = monthlySavings * 12;

      const prompt = `Você é um consultor especializado em gestão de compras industriais. 
Analise as respostas do diagnóstico abaixo e gere um parecer PERSONALIZADO e CONSULTIVO.

RESPOSTAS DO DIAGNÓSTICO:
${answersText}

SCORE DE RISCO: ${score}/40 (quanto maior, mais oportunidade de melhoria)
ECONOMIA POTENCIAL ESTIMADA: R$ ${monthlySavings.toLocaleString('pt-BR')}/mês (R$ ${annualSavings.toLocaleString('pt-BR')}/ano)

INSTRUÇÕES:
1. Gere uma HEADLINE impactante (máximo 15 palavras) que reflita a situação específica do usuário
2. Gere um DIAGNÓSTICO personalizado (3-4 frases) que:
   - Reconheça os pontos específicos mencionados nas respostas
   - Explique o impacto financeiro de forma clara
   - Use linguagem de consultor, não de vendedor
   - Seja direto e profissional

3. Liste 2-3 OPORTUNIDADES específicas baseadas nas respostas (cada uma com 1 frase curta)

FORMATO DE RESPOSTA (JSON):
{
  "headline": "sua headline aqui",
  "diagnostic": "seu diagnóstico personalizado aqui",
  "opportunities": ["oportunidade 1", "oportunidade 2", "oportunidade 3"],
  "savings": ${monthlySavings},
  "annualSavings": ${annualSavings}
}

IMPORTANTE: Retorne APENAS o JSON válido, sem explicações adicionais.`;

      console.log("[API] Generating AI diagnostic...");
      const startTime = Date.now();
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const response = result.response;
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No response from AI");
      }

      const text = response.candidates[0].content.parts[0].text || "";
      const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const diagnostic = JSON.parse(cleanText);

      console.log(`[API] AI diagnostic generated in ${Date.now() - startTime}ms`);
      
      res.json(diagnostic);
    } catch (error) {
      console.error("Error generating diagnostic:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to generate diagnostic", details: errorMessage });
    }
  });

  // PUT /api/config - Update app configuration (admin)
  app.put("/api/config", async (req, res) => {
    try {
      console.log("Received config update:", req.body);
      
      // Ensure proper types
      const configData = {
        dailyLimit: Number(req.body.dailyLimit) || 5,
        sessionLimit: Number(req.body.sessionLimit) || 3,
        trialDays: Number(req.body.trialDays) || 7,
        enableLimits: Boolean(req.body.enableLimits),
      };
      
      console.log("Parsed config data:", configData);
      
      const config = await storage.updateAppConfig(configData);
      res.json(config);
    } catch (error) {
      console.error("Error updating config:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: "Failed to update config", details: errorMessage });
    }
  });

  return httpServer;
}
