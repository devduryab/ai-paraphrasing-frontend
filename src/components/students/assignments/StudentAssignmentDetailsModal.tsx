// components/student/assignments/AssignmentDetailsModal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  MessageSquare,
} from "lucide-react";
import StudentAssignmentService from "@/services/student-assignment-services";
import { Assignment } from "@/interfaces/assignment/assignment-interface";
import SubmissionModal from "./StudentSubmissionModal";

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const service = StudentAssignmentService.getInstance();

  const isOverdue = service.isAssignmentOverdue(assignment.dueDate);
  const timeLeft = service.getTimeUntilDue(assignment.dueDate);
  const hasSubmission = assignment.mySubmission;

  const getStatusInfo = () => {
    if (hasSubmission) {
      switch (hasSubmission.status) {
        case "graded":
          return {
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-50",
            text: "Graded",
            description: `Grade: ${service.formatGrade(
              hasSubmission.grade,
              assignment.maxScore
            )}`,
          };
        case "submitted":
          return {
            icon: CheckCircle,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            text: "Submitted",
            description: "Waiting for grading",
          };
        case "late":
          return {
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
            text: "Late Submission",
            description: "Submitted after deadline",
          };
        default:
          return {
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            text: "In Progress",
            description: "Draft saved",
          };
      }
    }

    if (isOverdue) {
      return {
        icon: AlertCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: "Overdue",
        description: assignment.allowLateSubmission
          ? "Late submission allowed"
          : "Submission closed",
      };
    }

    return {
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      text: "Pending",
      description: "Not submitted yet",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleSubmissionSuccess = () => {
    setSubmissionModalOpen(false);
    onClose(); // Close the details modal and refresh parent
  };

  const canSubmit = () => {
    if (hasSubmission && hasSubmission.status === "graded") {
      return false; // Cannot resubmit graded assignments
    }
    if (isOverdue && !assignment.allowLateSubmission) {
      return false; // Cannot submit if overdue and late submission not allowed
    }
    return true;
  };

  const getSubmissionButtonText = () => {
    if (hasSubmission) {
      return hasSubmission.status === "graded"
        ? "Resubmission Not Allowed"
        : "Update Submission";
    }
    if (isOverdue) {
      return "Submit Late";
    }
    return "Submit Assignment";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {assignment.title}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Assignment Details</TabsTrigger>
              <TabsTrigger value="submission">My Submission</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardContent className="p-6">
                  <div
                    className={`flex items-center space-x-4 p-4 rounded-lg ${statusInfo.bgColor}`}
                  >
                    <div
                      className={`p-2 rounded-full bg-white ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{timeLeft}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Max Score</p>
                    <p className="font-semibold">
                      {assignment.maxScore} points
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold capitalize">
                      {assignment.assignmentType.replace("_", " ")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-gray-600">Late Submission</p>
                    <p className="font-semibold">
                      {assignment.allowLateSubmission
                        ? "Allowed"
                        : "Not Allowed"}
                    </p>
                    {assignment.latePenalty && assignment.latePenalty > 0 && (
                      <p className="text-xs text-gray-500">
                        {assignment.latePenalty}% penalty per day
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Course and Faculty Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Course Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Course:</span>{" "}
                        {typeof assignment.courseId === "string"
                          ? assignment.courseId
                          : assignment.courseId?.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Course ID:</span>{" "}
                        {typeof assignment.courseId === "string"
                          ? assignment.courseId
                          : assignment.courseId?._id || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Instructor</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {assignment.facultyId} {assignment.facultyId}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {assignment.facultyId || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description and Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {assignment.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {assignment.instructions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submission Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Submission Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        Assignment Type:{" "}
                        <strong>
                          {assignment.assignmentType
                            .replace("_", " ")
                            .toUpperCase()}
                        </strong>
                      </span>
                    </div>

                    {assignment.assignmentType === "text" && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Text submission required</span>
                      </div>
                    )}

                    {assignment.assignmentType === "file_upload" && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>File upload required</span>
                      </div>
                    )}

                    {assignment.assignmentType === "both" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Text submission required</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>File upload required</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>
                        Maximum Score:{" "}
                        <strong>{assignment.maxScore} points</strong>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {canSubmit() && (
                  <Button
                    onClick={() => setSubmissionModalOpen(true)}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{getSubmissionButtonText()}</span>
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="submission" className="space-y-6">
              {hasSubmission ? (
                <>
                  {/* Submission Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Submission Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge
                            className={service.getSubmissionStatusColor(
                              hasSubmission.status
                            )}
                          >
                            {hasSubmission.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Submitted At</p>
                          <p className="font-medium">
                            {new Date(
                              hasSubmission.submittedAt
                            ).toLocaleString()}
                          </p>
                          {hasSubmission.isLate && (
                            <p className="text-xs text-red-600">
                              Late Submission
                            </p>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Grade</p>
                          <p className="font-medium">
                            {hasSubmission.grade !== undefined
                              ? service.formatGrade(
                                  hasSubmission.grade,
                                  assignment.maxScore
                                )
                              : "Not graded yet"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submitted Content */}
                  {hasSubmission.submissionText && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Submitted Text</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">
                            {hasSubmission.submissionText}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Submitted Files */}
                  {hasSubmission.submissionFiles &&
                    hasSubmission.submissionFiles.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Submitted Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {hasSubmission.submissionFiles.map(
                              (file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4" />
                                    <span>{file}</span>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Faculty Feedback */}
                  {hasSubmission.feedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span>Faculty Feedback</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">
                            {hasSubmission.feedback}
                          </p>
                          {hasSubmission.grade && (
                            <p className="text-xs text-gray-500 mt-2">
                              Graded on:{" "}
                              {new Date(
                                hasSubmission.submittedAt
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Resubmit Button */}
                  {canSubmit() && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setSubmissionModalOpen(true)}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Update Submission</span>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Submission Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    You haven&apos;t submitted this assignment yet.
                  </p>
                  {canSubmit() && (
                    <Button
                      onClick={() => setSubmissionModalOpen(true)}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Submit Assignment</span>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
        assignment={assignment}
        onSuccess={handleSubmissionSuccess}
      />
    </>
  );
};

export default AssignmentDetailsModal;
