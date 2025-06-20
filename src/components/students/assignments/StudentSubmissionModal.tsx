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
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Trash2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import StudentAssignmentService from "@/services/student-assignment-services";
import {
  Assignment,
  CreateSubmissionData,
} from "@/interfaces/assignment/assignment-interface";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
  onSuccess: () => void;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
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

  const service = StudentAssignmentService.getInstance();

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
      } else {
        // Reset form for new submission
        setTextContent("");
        setSelectedFiles([]);
        setSubmissionData({
          assignmentId: assignment._id,
          submissionText: "",
          submissionFiles: [],
        });
      }
      setErrors([]);
    }
  }, [isOpen, assignment]);

  const isOverdue = service.isAssignmentOverdue(assignment.dueDate);
  const timeLeft = service.getTimeUntilDue(assignment.dueDate);
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

    if (
      requiresFiles &&
      selectedFiles.length === 0 &&
      !assignment.mySubmission?.submissionFiles?.length
    ) {
      newErrors.push("File upload is required for this assignment.");
    }

    if (textContent.trim().length > 5000) {
      newErrors.push("Text submission cannot exceed 5000 characters.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);

      // Validate file size (5MB limit per file)
      const oversizedFiles = fileArray.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setErrors(["Some files exceed the 5MB size limit."]);
        return;
      }

      setSelectedFiles((prev) => [...prev, ...fileArray]);
      setErrors([]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) {
      return;
    }

    try {
      setLoading(true);

      // In a real app, you would upload files first and get file URLs
      // For now, we'll simulate with file names
      // const fileNames = selectedFiles.map((file) => file.name);

      // const submissionPayload: CreateSubmissionData = {
      //   assignmentId: assignment._id,
      //   submissionText: requiresText ? textContent.trim() : undefined,
      //   submissionFiles: requiresFiles ? fileNames : undefined,
      // };

      // await service.submitAssignment(submissionPayload);
      onSuccess();
    } catch (error: any) {
      setErrors([error.message || "Failed to submit assignment"]);
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = () => {
    if (isOverdue) {
      return {
        icon: AlertCircle,
        text: "Late Submission",
        color: "text-red-600",
        bgColor: "bg-red-50",
        description: assignment.allowLateSubmission
          ? `Late submission allowed${
              assignment.latePenalty
                ? ` with ${assignment.latePenalty}% penalty`
                : ""
            }`
          : "Late submission not allowed",
      };
    }

    return {
      icon: Clock,
      text: "On Time",
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `Due in ${timeLeft}`,
    };
  };

  const status = getSubmissionStatus();
  const StatusIcon = status.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {assignment.mySubmission
                ? "Update Submission"
                : "Submit Assignment"}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">
                    Max: {assignment.maxScore} pts
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">
                    Type: {assignment.assignmentType.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div
                className={`flex items-center space-x-3 p-3 rounded-lg ${status.bgColor}`}
              >
                <StatusIcon className={`w-5 h-5 ${status.color}`} />
                <div>
                  <p className={`font-medium ${status.color}`}>{status.text}</p>
                  <p className="text-sm text-gray-600">{status.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">
                      Please fix the following errors:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Submission */}
          {requiresText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Text Submission</span>
                  <Badge variant="outline" className="text-red-600">
                    Required
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="submission-text">Your Answer</Label>
                  <Textarea
                    id="submission-text"
                    placeholder="Type your submission here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                    maxLength={5000}
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Maximum 5000 characters</span>
                    <span>{textContent.length}/5000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload */}
          {requiresFiles && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>File Upload</span>
                  <Badge variant="outline" className="text-red-600">
                    Required
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <Label htmlFor="file-upload">Select Files</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="mt-1"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max
                      5MB per file)
                    </p>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files</Label>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing Files (for updates) */}
                  {assignment.mySubmission?.submissionFiles &&
                    assignment.mySubmission.submissionFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Previously Submitted Files</Label>
                        {assignment.mySubmission.submissionFiles.map(
                          (file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm">{file}</span>
                                <Badge
                                  variant="outline"
                                  className="text-blue-600"
                                >
                                  Previously Submitted
                                </Badge>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Warning */}
          {isOverdue && assignment.allowLateSubmission && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">
                      Late Submission Warning
                    </p>
                    <p className="text-sm text-orange-700">
                      This assignment is overdue.
                      {assignment.latePenalty &&
                        assignment.latePenalty > 0 &&
                        ` A penalty of ${assignment.latePenalty}% per day will be applied.`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                loading || (isOverdue && !assignment.allowLateSubmission)
              }
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {assignment.mySubmission
                      ? "Update Submission"
                      : "Submit Assignment"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionModal;
