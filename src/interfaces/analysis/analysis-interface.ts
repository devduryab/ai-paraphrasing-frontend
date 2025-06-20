// interfaces/analysis/analysis-interface.ts

export enum AnalysisType {
  PARAPHRASING = "paraphrasing",
  PLAGIARISM = "plagiarism",
  SIMILARITY = "similarity",
  CONTENT_ANALYSIS = "content_analysis",
}

export enum AnalysisStatus {
  PENDING = "pending",
  PROCESSING = "processing", 
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum IntegrityRisk {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface FlaggedSection {
  startIndex: number;
  endIndex: number;
  text: string;
  reason: string;
  confidence: number;
  suggestedAction: string;
}

export interface AnalysisResult {
  _id: string;
  submissionId: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  confidence: number;
  isParaphrased: boolean;
  similarityScore: number;
  integrityRisk: IntegrityRisk;
  detectedTechniques: string[];
  originalSources: string[];
  suspiciousPatterns: string[];
  explanation: string;
  recommendations: string[];
  flaggedSections: FlaggedSection[];
  processedAt: Date;
  processingTime: number;
  errorMessage?: string;
  aiResponse?: {
    rawResponse: string;
    modelUsed: string;
    tokensUsed: number;
    responseTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalysisRequest {
  submissionId: string;
  analysisTypes: AnalysisType[];
  priority: 'low' | 'normal' | 'high';
  options?: {
    includeSourceDetection?: boolean;
    deepAnalysis?: boolean;
    compareWithDatabase?: boolean;
    extractTextFromFiles?: boolean;
  };
}

export interface AnalysisSummary {
  submissionId: string;
  overallStatus: AnalysisStatus;
  overallRisk: IntegrityRisk;
  overallConfidence: number;
  isParaphrased: boolean;
  analysisCount: number;
  completedAt?: Date;
  flaggedSectionsCount: number;
  detectedTechniques: string[];
  recommendations: string[];
}

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  isPaused: boolean;
}

export interface HealthStatus {
  openai: boolean;
  redis: boolean;
  queue: boolean;
  overall: boolean;
}