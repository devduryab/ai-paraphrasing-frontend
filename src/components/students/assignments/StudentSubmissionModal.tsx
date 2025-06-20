"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Trash2,
  Brain,
  Shield,
  Loader2,
} from "lucide-react";
import StudentAssignmentService from "@/services/student-assignment-services";
import AIAnalysisService from "@/services/ai-analysis-service";
import {
  Assignment,
  CreateSubmissionData,
} from "@/interfaces/assignment/assignment-interface";
import { AnalysisStatus } from "@/interfaces/analysis/analysis-interface";

interface EnhancedSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onSuccess: () => void;
}

const StudentSubmissionModal: React.FC<EnhancedSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) => {
  const [submissionData, setSubmissionData] = useState<CreateSubmissionData>({
    assignmentId: assignment._id,
    submissionText: "",
    submissionFiles: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(
    null
  );
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const studentService = StudentAssignmentService.getInstance();
  const aiService = AIAnalysisService.getInstance();

  useEffect(() => {
    if (isOpen) {
      // Initialize with existing submission data if available
      if (assignment.mySubmission) {
        setTextContent(assignment.mySubmission.submissionText || "");
        setSubmissionData((prev) => ({
          ...prev,
          submissionText: assignment.mySubmission?.submissionText || "",
          submissionFiles: assignment.mySubmission?.submissionFiles || [],
        }));
        setSubmissionId(assignment.mySubmission._id);

        // Check for existing analysis
        if (assignment.mySubmission._id) {
          checkAnalysisStatus(assignment.mySubmission._id);
        }
      } else {
        // Reset form for new submission
        setTextContent("");
        setSelectedFiles([]);
        setSubmissionData({
          assignmentId: assignment._id,
          submissionText: "",
          submissionFiles: [],
        });
        setSubmissionId(null);
        setAnalysisStatus(null);
      }
      setErrors([]);
    }
  }, [isOpen, assignment]);

  const checkAnalysisStatus = async (submissionId: string) => {
    try {
      const status = await aiService.getAnalysisStatus(submissionId);
      setAnalysisStatus(status.status);
    } catch (error) {
      console.error("Error checking analysis status:", error);
    }
  };

  const isOverdue = studentService.isAssignmentOverdue(assignment.dueDate);
  const timeLeft = studentService.getTimeUntilDue(assignment.dueDate);
  const requiresText =
    assignment.assignmentType === "text" ||
    assignment.assignmentType === "both";
  const requiresFiles =
    assignment.assignmentType === "file_upload" ||
    assignment.assignmentType === "both";

  const validateSubmission = (): boolean => {
    const newErrors: string[] = [];

    if (requiresText && !textContent.trim()) {
      newErrors.push("Text submission is required for this assignment.");
    }

    if (requiresFiles && selectedFiles.length === 0) {
      newErrors.push("File upload is required for this assignment.");
    }

    if (textContent.trim().length > 0 && textContent.trim().length < 50) {
      newErrors.push("Submission text must be at least 50 characters long.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("assignmentId", assignment._id);
      formData.append("submissionText", textContent);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      let result;
      if (assignment.mySubmission) {
        // Update existing submission
        result = await studentService.updateSubmission(
          assignment.mySubmission._id,
          formData
        );
      } else {
        // Create new submission
        result = await studentService.createSubmission(formData);
      }

      if (result.success) {
        const newSubmissionId = result.data._id;
        setSubmissionId(newSubmissionId);

        // Automatically queue AI analysis for the submission
        if (textContent.trim().length >= 50) {
          await queueAnalysis(newSubmissionId);
        }

        onSuccess();
        onClose();
      } else {
        setErrors([result.error || "Failed to submit assignment"]);
      }
    } catch (error: any) {
      setErrors([error.message || "An error occurred while submitting"]);
    } finally {
      setLoading(false);
    }
  };

  const queueAnalysis = async (submissionId: string) => {
    try {
      setAnalysisLoading(true);
      setAnalysisStatus(AnalysisStatus.PENDING);

      const result = await aiService.analyzeSubmission(
        submissionId,
        ["paraphrasing"],
        "normal"
      );

      if (result.status === "success") {
        // Start polling for analysis status
        pollAnalysisStatus(submissionId);
      }
    } catch (error: any) {
      console.error("Error queuing analysis:", error);
      // Don't show error to user as analysis is optional
    } finally {
      setAnalysisLoading(false);
    }
  };

  const pollAnalysisStatus = async (submissionId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await aiService.getAnalysisStatus(submissionId);
        setAnalysisStatus(status.status);

        if (
          status.status === AnalysisStatus.COMPLETED ||
          status.status === AnalysisStatus.FAILED ||
          attempts >= maxAttempts
        ) {
          return;
        }

        attempts++;
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        console.error("Error polling analysis status:", error);
      }
    };

    poll();
  };

  const getAnalysisStatusDisplay = () => {
    if (analysisLoading) {
      return (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            Queuing AI analysis for paraphrasing detection...
          </AlertDescription>
        </Alert>
      );
    }

    if (!analysisStatus) return null;

    const statusConfig = {
      [AnalysisStatus.PENDING]: {
        icon: Clock,
        color: "border-yellow-200 bg-yellow-50",
        textColor: "text-yellow-800",
        message: "AI analysis is queued for processing",
      },
      [AnalysisStatus.PROCESSING]: {
        icon: Brain,
        color: "border-blue-200 bg-blue-50",
        textColor: "text-blue-800",
        message: "AI is analyzing your submission for paraphrasing...",
      },
      [AnalysisStatus.COMPLETED]: {
        icon: CheckCircle,
        color: "border-green-200 bg-green-50",
        textColor: "text-green-800",
        message: "AI analysis completed successfully",
      },
      [AnalysisStatus.FAILED]: {
        icon: AlertCircle,
        color: "border-red-200 bg-red-50",
        textColor: "text-red-800",
        message: "AI analysis failed - please contact your instructor",
      },
    };

    const config = statusConfig[analysisStatus];
    const Icon = config.icon;

    return (
      <Alert className={config.color}>
        <Icon className={`h-4 w-4 ${config.textColor}`} />
        <AlertDescription className={config.textColor}>
          <div className="flex items-center justify-between">
            <span>{config.message}</span>
            {analysisStatus === AnalysisStatus.PROCESSING && (
              <Loader2 className="h-4 w-4 animate-spin ml-2" />
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {assignment.mySubmission
              ? "Update Submission"
              : "Submit Assignment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Due Date:</span>
                  <span className={`ml-2 ${isOverdue ? "text-red-600" : ""}`}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Max Score:</span>
                  <span className="ml-2">{assignment.maxScore} points</span>
                </div>
                <div>
                  <span className="font-medium">Time Remaining:</span>
                  <span className={`ml-2 ${isOverdue ? "text-red-600" : ""}`}>
                    {timeLeft}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Submission Type:</span>
                  <span className="ml-2 capitalize">
                    {assignment.assignmentType.replace("_", " ")}
                  </span>
                </div>
              </div>

              {assignment.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-700">{assignment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Status */}
          {getAnalysisStatusDisplay()}

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Your Submission
                <Badge variant="outline" className="ml-2">
                  <Shield className="w-3 h-3 mr-1" />
                  AI Protected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Text Submission */}
              {requiresText && (
                <div>
                  <Label htmlFor="submissionText">
                    Text Submission {requiresText && "*"}
                  </Label>
                  <Textarea
                    id="submissionText"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter your submission text here..."
                    rows={8}
                    disabled={loading}
                    className={
                      errors.some((e) => e.includes("text"))
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">
                      {textContent.length} characters
                    </span>
                    {textContent.length >= 50 && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Will be analyzed by AI
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload */}
              {requiresFiles && (
                <div>
                  <Label htmlFor="fileUpload">
                    File Upload {requiresFiles && "*"}
                  </Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                    className={
                      errors.some((e) => e.includes("File"))
                        ? "border-red-500"
                        : ""
                    }
                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB
                    each)
                  </p>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3">
                      <Label>Selected Files:</Label>
                      <div className="space-y-2 mt-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm truncate">
                              {file.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Analysis Notice */}
              <Alert className="border-blue-200 bg-blue-50">
                <Brain className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>AI Analysis:</strong> Your submission will be
                  automatically analyzed for paraphrasing and academic
                  integrity. This helps ensure originality and provides feedback
                  to your instructor.
                </AlertDescription>
              </Alert>

              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <ul className="list-disc list-inside text-red-800">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || isOverdue}
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : assignment.mySubmission ? (
                    "Update Submission"
                  ) : (
                    "Submit Assignment"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSubmissionModal;
