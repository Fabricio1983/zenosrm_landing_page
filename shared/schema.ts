import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  nome: text("nome"),
  email: text("email").notNull(),
  empresa: text("empresa").notNull(),
  telefone: text("telefone"),
  source: text("source").default("waitlist"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const equalizations = pgTable("equalizations", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  fornecedores: jsonb("fornecedores").notNull(),
  items: jsonb("items").notNull(),
  totalSavings: integer("total_savings").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appConfig = pgTable("app_config", {
  id: serial("id").primaryKey(),
  dailyLimit: integer("daily_limit").notNull().default(5),
  sessionLimit: integer("session_limit").notNull().default(3),
  trialDays: integer("trial_days").notNull().default(7),
  enableLimits: boolean("enable_limits").notNull().default(true),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertEqualizationSchema = createInsertSchema(equalizations).omit({
  id: true,
  createdAt: true,
});

export const insertAppConfigSchema = createInsertSchema(appConfig).omit({
  id: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertEqualization = z.infer<typeof insertEqualizationSchema>;
export type Equalization = typeof equalizations.$inferSelect;

export type InsertAppConfig = z.infer<typeof insertAppConfigSchema>;
export type AppConfig = typeof appConfig.$inferSelect;
