
import { AnalysisResult } from "../interfaces/analysis/analysis-interface";
import { AnalysisStatus } from "../interfaces/analysis/analysis-interface";



export interface AnalysisResponse {
  status: string;
  message: string;
  data: any;
}

export interface AnalysisStatistics {
  totalAnalyses: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  failedAnalyses: number;
  paraphrasedCount: number;
  originalCount: number;
  averageConfidence: number;
}

class AIAnalysisService {
  private static instance: AIAnalysisService;
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  private constructor() {}

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined") {
      throw new Error("No authentication token found. Please login again.");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Queue analysis for a submission
   */
  async analyzeSubmission(
    submissionId: string,
    analysisTypes: string[] = ["paraphrasing"],
    priority: "low" | "normal" | "high" = "normal"
  ): Promise<AnalysisResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/submissions/${submissionId}/analyze`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            analysisTypes,
            priority,
            options: {
              includeSourceDetection: true,
              deepAnalysis: true,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to queue analysis");
      }

      return data;
    } catch (error) {
      console.error("Error queuing analysis:", error);
      throw error;
    }
  }

  /**
   * Get analysis results for a submission
   */
  async getSubmissionAnalysis(submissionId: string): Promise<AnalysisResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/submissions/${submissionId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get analysis results");
      }

      return data.data.analyses || [];
    } catch (error) {
      console.error("Error getting analysis results:", error);
      throw error;
    }
  }

  /**
   * Get analysis status for a submission
   */
  async getAnalysisStatus(submissionId: string): Promise<{
    status: AnalysisStatus;
    progress?: number;
    summary?: any;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/submissions/${submissionId}/status`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get analysis status");
      }

      return data.data;
    } catch (error) {
      console.error("Error getting analysis status:", error);
      throw error;
    }
  }

  /**
   * Reanalyze a submission
   */
  async reanalyzeSubmission(
    submissionId: string,
    analysisTypes: string[] = ["paraphrasing"]
  ): Promise<AnalysisResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/submissions/${submissionId}/reanalyze`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            analysisTypes,
            options: {
              includeSourceDetection: true,
              deepAnalysis: true,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reanalyze submission");
      }

      return data;
    } catch (error) {
      console.error("Error reanalyzing submission:", error);
      throw error;
    }
  }

  /**
   * Get analysis statistics (for faculty dashboard)
   */
  async getAnalysisStatistics(): Promise<AnalysisStatistics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/statistics`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get analysis statistics");
      }

      return data.data.statistics;
    } catch (error) {
      console.error("Error getting analysis statistics:", error);
      throw error;
    }
  }

  /**
   * Get recent analyses (for faculty dashboard)
   */
  async getRecentAnalyses(limit: number = 10): Promise<AnalysisResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/recent?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get recent analyses");
      }

      return data.data.analyses || [];
    } catch (error) {
      console.error("Error getting recent analyses:", error);
      throw error;
    }
  }

  /**
   * Get analyses by risk level
   */
  async getAnalysesByRisk(
    riskLevel: "low" | "medium" | "high" | "critical",
    limit: number = 10
  ): Promise<AnalysisResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/risk/${riskLevel}?limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get analyses by risk");
      }

      return data.data.analyses || [];
    } catch (error) {
      console.error("Error getting analyses by risk:", error);
      throw error;
    }
  }

  /**
   * Flag analysis for review
   */
  async flagAnalysisForReview(
    analysisId: string,
    reason: string,
    reviewerNotes?: string
  ): Promise<AnalysisResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/results/${analysisId}/flag`,
        {
          method: "PUT",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            reason,
            reviewerNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to flag analysis");
      }

      return data;
    } catch (error) {
      console.error("Error flagging analysis:", error);
      throw error;
    }
  }

  /**
   * Get AI service health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analysis/health`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error getting health status:", error);
      throw error;
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/analysis/queue/status`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error getting queue status:", error);
      throw error;
    }
  }
}

export default AIAnalysisService;
