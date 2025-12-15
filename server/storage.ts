import { leads, equalizations, appConfig, type Lead, type InsertLead, type Equalization, type InsertEqualization, type AppConfig, type InsertAppConfig } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getAllLeads(): Promise<Lead[]>;
  
  // Equalizations
  createEqualization(equalization: InsertEqualization): Promise<Equalization>;
  getEqualizationsByLead(leadId: number): Promise<Equalization[]>;
  
  // App Config
  getAppConfig(): Promise<AppConfig | undefined>;
  updateAppConfig(config: InsertAppConfig): Promise<AppConfig>;
}

export class DatabaseStorage implements IStorage {
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createEqualization(insertEqualization: InsertEqualization): Promise<Equalization> {
    const [equalization] = await db
      .insert(equalizations)
      .values(insertEqualization)
      .returning();
    return equalization;
  }

  async getEqualizationsByLead(leadId: number): Promise<Equalization[]> {
    return await db.select().from(equalizations).where(eq(equalizations.leadId, leadId));
  }

  async getAppConfig(): Promise<AppConfig | undefined> {
    const [config] = await db.select().from(appConfig).limit(1);
    return config || undefined;
  }

  async updateAppConfig(config: InsertAppConfig): Promise<AppConfig> {
    const existing = await this.getAppConfig();
    
    if (existing) {
      const [updated] = await db
        .update(appConfig)
        .set(config)
        .where(eq(appConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(appConfig)
        .values(config)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
