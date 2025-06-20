"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  RefreshCw,
  Eye,
  Flag,
  BarChart3,
  Loader2,
} from "lucide-react";
import AIAnalysisService from "@/services/ai-analysis-service";
import {
  AnalysisResult,
  AnalysisStatus,
  IntegrityRisk,
} from "@/interfaces/analysis/analysis-interface";

interface AnalysisStatistics {
  totalAnalyses: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  failedAnalyses: number;
  paraphrasedCount: number;
  originalCount: number;
  averageConfidence: number;
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AnalysisCardProps {
  analysis: AnalysisResult;
  onViewDetails: (analysis: AnalysisResult) => void;
  onFlag: (analysis: AnalysisResult) => void;
  onReanalyze: (submissionId: string) => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onViewDetails,
  onFlag,
  onReanalyze,
}) => {
  const getRiskColor = (risk: IntegrityRisk) => {
    switch (risk) {
      case IntegrityRisk.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      case IntegrityRisk.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case IntegrityRisk.HIGH:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case IntegrityRisk.CRITICAL:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: AnalysisStatus) => {
    switch (status) {
      case AnalysisStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case AnalysisStatus.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case AnalysisStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case AnalysisStatus.FAILED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">
                Submission {analysis.submissionId.slice(-6)}
              </span>
            </div>
            <Badge className={getStatusColor(analysis.status)}>
              {analysis.status}
            </Badge>
          </div>

          {/* Analysis Results */}
          {analysis.status === AnalysisStatus.COMPLETED && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Paraphrasing Risk:
                </span>
                <Badge className={getRiskColor(analysis.integrityRisk)}>
                  {analysis.integrityRisk.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className="text-sm font-medium">
                  {analysis.confidence}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Is Paraphrased:</span>
                <Badge
                  className={
                    analysis.isParaphrased
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {analysis.isParaphrased ? "Yes" : "No"}
                </Badge>
              </div>

              {analysis.flaggedSections.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Flagged Sections:
                  </span>
                  <span className="text-sm font-medium text-orange-600">
                    {analysis.flaggedSections.length}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Processing Info */}
          {analysis.status === AnalysisStatus.PROCESSING && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI analysis in progress...</span>
            </div>
          )}

          {/* Error Info */}
          {analysis.status === AnalysisStatus.FAILED &&
            analysis.errorMessage && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  {analysis.errorMessage}
                </AlertDescription>
              </Alert>
            )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500">
            <div>
              Processed: {new Date(analysis.processedAt).toLocaleString()}
            </div>
            {analysis.processingTime > 0 && (
              <div>Processing time: {analysis.processingTime}ms</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(analysis)}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>

            {analysis.status === AnalysisStatus.COMPLETED && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFlag(analysis)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Flag className="w-3 h-3 mr-1" />
                Flag
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onReanalyze(analysis.submissionId)}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reanalyze
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FacultyAnalysisDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<AnalysisStatistics | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([]);
  const [riskAnalyses, setRiskAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>("high");

  const aiService = AIAnalysisService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedRiskFilter) {
      loadRiskAnalyses(selectedRiskFilter as any);
    }
  }, [selectedRiskFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, recentData] = await Promise.all([
        aiService.getAnalysisStatistics(),
        aiService.getRecentAnalyses(10),
      ]);

      setStatistics(statsData);
      setRecentAnalyses(recentData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRiskAnalyses = async (riskLevel: IntegrityRisk) => {
    try {
      const riskData = await aiService.getAnalysesByRisk(riskLevel, 5);
      setRiskAnalyses(riskData);
    } catch (error) {
      console.error("Error loading risk analyses:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleViewDetails = (analysis: AnalysisResult) => {
    // TODO: Open detailed analysis modal
    console.log("View details for:", analysis);
  };

  const handleFlag = async (analysis: AnalysisResult) => {
    try {
      const reason = prompt(
        "Please provide a reason for flagging this analysis:"
      );
      if (reason) {
        await aiService.flagAnalysisForReview(analysis._id, reason);
        await loadDashboardData();
      }
    } catch (error) {
      console.error("Error flagging analysis:", error);
    }
  };

  const handleReanalyze = async (submissionId: string) => {
    try {
      await aiService.reanalyzeSubmission(submissionId);
      await loadDashboardData();
    } catch (error) {
      console.error("Error reanalyzing submission:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading analysis dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Analyses"
            value={statistics.totalAnalyses}
            icon={BarChart3}
            color="bg-blue-500"
            subtitle="All submissions analyzed"
          />
          <StatsCard
            title="Completed"
            value={statistics.completedAnalyses}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle={`${statistics.pendingAnalyses} pending`}
          />
          <StatsCard
            title="Paraphrased Content"
            value={statistics.paraphrasedCount}
            icon={AlertTriangle}
            color="bg-orange-500"
            subtitle={`${statistics.originalCount} original`}
          />
          <StatsCard
            title="Avg Confidence"
            value={Math.round(statistics.averageConfidence)}
            icon={TrendingUp}
            color="bg-purple-500"
            subtitle="Detection accuracy"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-3">
                {recentAnalyses.slice(0, 5).map((analysis) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    onViewDetails={handleViewDetails}
                    onFlag={handleFlag}
                    onReanalyze={handleReanalyze}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No analyses available yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* High Risk Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk-Based Analyses
              </div>
              <Select
                value={selectedRiskFilter}
                onValueChange={setSelectedRiskFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskAnalyses.length > 0 ? (
              <div className="space-y-3">
                {riskAnalyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    onViewDetails={handleViewDetails}
                    onFlag={handleFlag}
                    onReanalyze={handleReanalyze}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No {selectedRiskFilter} risk analyses found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">OpenAI Service: Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Redis Queue: Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Analysis Engine: Running</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyAnalysisDashboard;
