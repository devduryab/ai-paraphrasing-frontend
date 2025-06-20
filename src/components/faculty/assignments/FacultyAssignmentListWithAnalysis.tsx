// components/faculty/assignments/FacultyAssignmentListWithAnalysis.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Users, Brain, Eye, Clock } from "lucide-react";
import {
  Assignment,
  SubmissionWithAnalysis,
  SubmissionStatus,
} from "@/interfaces/assignment/assignment-interface";
import { AnalysisStatus } from "@/interfaces/analysis/analysis-interface";
import AssignmentService from "@/services/assignment-service";
import AIAnalysisService from "@/services/ai-analysis-service";
import AnalysisDetailModal from "../analysis/AnalysisDetailModal";

interface AssignmentWithAnalytics extends Assignment {
  analytics: {
    totalSubmissions: number;
    analyzedSubmissions: number;
    flaggedSubmissions: number;
    averageIntegrityScore: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
}

interface SubmissionCardProps {
  submission: SubmissionWithAnalysis;
  onViewAnalysis: (submission: SubmissionWithAnalysis) => void;
  onGrade: (submissionId: string) => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  submission,
  onViewAnalysis,
  onGrade,
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.GRADED:
        return "bg-green-100 text-green-800";
      case SubmissionStatus.SUBMITTED:
        return "bg-blue-100 text-blue-800";
      case SubmissionStatus.LATE:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasAnalysis =
    submission.analysis && submission.analysis.results.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Student Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {submission.student?.profile?.firstName}{" "}
                {submission.student?.profile?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {submission.student?.email}
              </p>
            </div>
            <Badge className={getStatusColor(submission.status)}>
              {submission.status}
            </Badge>
          </div>

          {/* Submission Details */}
          <div className="text-sm text-gray-600">
            <div>
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </div>
            {submission.grade && (
              <div>
                Grade: {submission.grade} / {submission.assignmentId}
              </div>
            )}
          </div>

          {/* AI Analysis Status */}
          {hasAnalysis ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">AI Analysis</span>
                <Badge
                  className={getRiskColor(
                    submission.analysis?.summary?.overallRisk || "low"
                  )}
                >
                  {submission.analysis?.summary?.overallRisk?.toUpperCase() ||
                    "LOW"}{" "}
                  RISK
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Confidence:</span>
                  <span className="ml-1 font-medium">
                    {submission.analysis?.summary?.confidence || 0}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Paraphrased:</span>
                  <span
                    className={`ml-1 font-medium ${
                      submission.analysis?.summary?.isParaphrased
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {submission.analysis?.summary?.isParaphrased ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              {(submission.analysis?.summary?.flaggedSections || 0) > 0 && (
                <div className="text-xs text-orange-600">
                  ⚠ {submission.analysis?.summary?.flaggedSections || 0} flagged
                  sections
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {submission.analysis?.status === AnalysisStatus.PROCESSING
                  ? "Analysis in progress..."
                  : submission.analysis?.status === AnalysisStatus.PENDING
                  ? "Analysis queued"
                  : "No analysis available"}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewAnalysis(submission)}
              disabled={!hasAnalysis}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              View Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGrade(submission._id)}
              className="flex-1"
            >
              <FileText className="w-3 h-3 mr-1" />
              {submission.status === SubmissionStatus.GRADED
                ? "Update Grade"
                : "Grade"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FacultyAssignmentListWithAnalysis: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithAnalytics[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentWithAnalytics | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<SubmissionWithAnalysis | null>(null);

  const assignmentService = AssignmentService.getInstance();
  const aiService = AIAnalysisService.getInstance();

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions(selectedAssignment._id);
    }
  }, [selectedAssignment]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getAllAssignments();
      const result = { success: true, data: assignments };

      if (result.success) {
        // Enhance assignments with analytics
        const enhancedAssignments = await Promise.all(
          result.data.map(async (assignment: Assignment) => {
            const analytics = await getAssignmentAnalytics(assignment._id);
            return { ...assignment, analytics };
          })
        );

        setAssignments(enhancedAssignments);
        if (enhancedAssignments.length > 0) {
          setSelectedAssignment(enhancedAssignments[0]);
        }
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentAnalytics = async (assignmentId: string) => {
    try {
      // This would be a new endpoint in your backend
      // For now, we'll simulate the data
      return {
        totalSubmissions: Math.floor(Math.random() * 50) + 10,
        analyzedSubmissions: Math.floor(Math.random() * 40) + 8,
        flaggedSubmissions: Math.floor(Math.random() * 5),
        averageIntegrityScore: Math.floor(Math.random() * 30) + 70,
        riskDistribution: {
          low: Math.floor(Math.random() * 20) + 10,
          medium: Math.floor(Math.random() * 10) + 5,
          high: Math.floor(Math.random() * 5) + 2,
          critical: Math.floor(Math.random() * 2),
        },
      };
    } catch (error) {
      console.error("Error getting assignment analytics:", error);
      return {
        totalSubmissions: 0,
        analyzedSubmissions: 0,
        flaggedSubmissions: 0,
        averageIntegrityScore: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      };
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    try {
      // getAssignmentSubmissions returns SubmissionWithDetails[] directly
      const submissions = await assignmentService.getAssignmentSubmissions(
        assignmentId
      );

      // Enhance submissions with analysis data
      const enhancedSubmissions = await Promise.all(
        submissions.map(async (submission: any) => {
          try {
            const analysisResults = await aiService.getSubmissionAnalysis(
              submission._id
            );
            const analysisStatus = await aiService.getAnalysisStatus(
              submission._id
            );

            return {
              ...submission,
              analysis: {
                status: analysisStatus?.status || AnalysisStatus.PENDING,
                results: analysisResults || [],
                summary: analysisStatus?.summary,
              },
            };
          } catch (error) {
            return {
              ...submission,
              analysis: {
                status: AnalysisStatus.PENDING,
                results: [],
              },
            };
          }
        })
      );

      setSubmissions(enhancedSubmissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const handleViewAnalysis = (submission: SubmissionWithAnalysis) => {
    setSelectedAnalysis(submission);
  };

  const handleGrade = (submissionId: string) => {
    // TODO: Open grading modal
    console.log("Grade submission:", submissionId);
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student?.profile?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.student?.profile?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.student?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    const matchesRisk =
      riskFilter === "all" ||
      submission.analysis?.summary?.overallRisk === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Assignment Management
          </h1>
          <p className="text-gray-600">
            Monitor submissions and AI analysis results
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedAssignment?._id === assignment._id
                      ? "bg-blue-50 border-blue-200 border"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedAssignment(assignment)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{assignment.title}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {assignment.analytics.totalSubmissions} submissions
                      </Badge>
                      {assignment.analytics.flaggedSubmissions > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          {assignment.analytics.flaggedSubmissions} flagged
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Details & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAssignment && (
            <>
              {/* Assignment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedAssignment.title}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedAssignment.analytics.totalSubmissions}{" "}
                      Submissions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedAssignment.analytics.analyzedSubmissions}
                      </div>
                      <div className="text-sm text-gray-500">Analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedAssignment.analytics.flaggedSubmissions}
                      </div>
                      <div className="text-sm text-gray-500">Flagged</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedAssignment.analytics.averageIntegrityScore}%
                      </div>
                      <div className="text-sm text-gray-500">Avg Integrity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedAssignment.analytics.riskDistribution.critical}
                      </div>
                      <div className="text-sm text-gray-500">Critical Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="graded">Graded</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={riskFilter} onValueChange={setRiskFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Submissions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Submissions ({filteredSubmissions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSubmissions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSubmissions.map((submission) => (
                        <SubmissionCard
                          key={submission._id}
                          submission={submission}
                          onViewAnalysis={handleViewAnalysis}
                          onGrade={handleGrade}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No submissions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Analysis Detail Modal */}
      <AnalysisDetailModal
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        analysis={selectedAnalysis?.analysis?.results?.[0] || null}
        onFlag={async (analysis, reason) => {
          await aiService.flagAnalysisForReview(analysis._id, reason);
          if (selectedAssignment) {
            loadSubmissions(selectedAssignment._id);
          }
        }}
        onReanalyze={async (submissionId) => {
          await aiService.reanalyzeSubmission(submissionId);
          if (selectedAssignment) {
            loadSubmissions(selectedAssignment._id);
          }
        }}
      />
    </div>
  );
};

export default FacultyAssignmentListWithAnalysis;
