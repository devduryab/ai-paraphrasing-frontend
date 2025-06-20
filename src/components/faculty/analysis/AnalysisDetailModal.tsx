// components/faculty/analysis/AnalysisDetailModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Target,
  Flag,
  Lightbulb,
  TrendingUp,
  X,
} from "lucide-react";
import {
  AnalysisResult,
  IntegrityRisk,
  AnalysisStatus,
} from "@/interfaces/analysis/analysis-interface";

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
  onFlag?: (analysis: AnalysisResult, reason: string) => void;
  onReanalyze?: (submissionId: string) => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onFlag,
  onReanalyze,
}) => {
  if (!analysis) return null;

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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-red-600";
    if (confidence >= 60) return "text-orange-600";
    if (confidence >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const handleFlag = () => {
    const reason = prompt("Please provide a reason for flagging this analysis:");
    if (reason && onFlag) {
      onFlag(analysis, reason);
    }
  };

  const handleReanalyze = () => {
    if (onReanalyze) {
      onReanalyze(analysis.submissionId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analysis Results
            <Badge className={getRiskColor(analysis.integrityRisk)}>
              {analysis.integrityRisk.toUpperCase()} RISK
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Confidence Score</span>
                </div>
                <p className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence)}`}>
                  {analysis.confidence}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Paraphrasing Status</span>
                </div>
                <p className={`text-lg font-bold ${analysis.isParaphrased ? 'text-red-600' : 'text-green-600'}`}>
                  {analysis.isParaphrased ? "Detected" : "Not Detected"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Similarity Score</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.similarityScore}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detected Techniques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detected Techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.detectedTechniques.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.detectedTechniques.map((technique, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-2">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specific techniques detected</p>
                )}
              </CardContent>
            </Card>

            {/* Suspicious Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Suspicious Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysis.suspiciousPatterns.length > 0 ? (
                  <ul className="space-y-1">
                    {analysis.suspiciousPatterns.map((pattern, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No suspicious patterns identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Flagged Sections */}
          {analysis.flaggedSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Flagged Sections ({analysis.flaggedSections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.flaggedSections.map((section, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          Section {index + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Confidence: {section.confidence}%
                          </span>
                          <Badge className={getConfidenceColor(section.confidence)}>
                            {section.confidence >= 70 ? "High" : section.confidence >= 40 ? "Medium" : "Low"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="text-sm font-mono">{section.text}</p>
                      </div>
                      
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">
                          <strong>Reason:</strong> {section.reason}
                        </p>
                        {section.suggestedAction && (
                          <p className="text-blue-600">
                            <strong>Suggested Action:</strong> {section.suggestedAction}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          {analysis.explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{analysis.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Original Sources */}
          {analysis.originalSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Potential Original Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {analysis.originalSources.map((source, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {source}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Analysis Type:</span>
                  <span className="ml-2 capitalize">{analysis.analysisType}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className="ml-2">{analysis.status}</Badge>
                </div>
                <div>
                  <span className="font-medium">Processed At:</span>
                  <span className="ml-2">{new Date(analysis.processedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Processing Time:</span>
                  <span className="ml-2">{analysis.processingTime}ms</span>
                </div>
                {analysis.aiResponse && (
                  <>
                    <div>
                      <span className="font-medium">AI Model:</span>
                      <span className="ml-2">{analysis.aiResponse.modelUsed}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tokens Used:</span>
                      <span className="ml-2">{analysis.aiResponse.tokensUsed}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {analysis.status === AnalysisStatus.COMPLETED && onFlag && (
                <Button
                  variant="outline"
                  onClick={handleFlag}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Flag for Review
                </Button>
              )}
              
              {onReanalyze && (
                <Button
                  variant="outline"
                  onClick={handleReanalyze}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Reanalyze
                </Button>
              )}
            </div>
            
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailModal;