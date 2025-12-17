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
