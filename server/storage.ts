import { analysis, namedAnalysis, type Analysis, type NamedAnalysis, type InsertAnalysis, type InsertNamedAnalysis } from "@shared/schema";

// Interface for storage
export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAnalyses(): Promise<Analysis[]>;
  saveNamedAnalysis(namedAnalysis: InsertNamedAnalysis): Promise<NamedAnalysis>;
  getNamedAnalysis(id: number): Promise<NamedAnalysis | undefined>;
  getNamedAnalyses(): Promise<NamedAnalysis[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private namedAnalyses: Map<number, NamedAnalysis>;
  private analysisId: number;
  private namedAnalysisId: number;

  constructor() {
    this.analyses = new Map();
    this.namedAnalyses = new Map();
    this.analysisId = 1;
    this.namedAnalysisId = 1;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisId++;
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent
    });
  }

  async saveNamedAnalysis(insertNamedAnalysis: InsertNamedAnalysis): Promise<NamedAnalysis> {
    const id = this.namedAnalysisId++;
    const namedAnalysis: NamedAnalysis = { ...insertNamedAnalysis, id };
    this.namedAnalyses.set(id, namedAnalysis);
    return namedAnalysis;
  }

  async getNamedAnalysis(id: number): Promise<NamedAnalysis | undefined> {
    return this.namedAnalyses.get(id);
  }

  async getNamedAnalyses(): Promise<NamedAnalysis[]> {
    return Array.from(this.namedAnalyses.values()).sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB.getTime() - dateA.getTime(); // Sort by most recent
    });
  }
}

// Export a singleton instance
export const storage = new MemStorage();
