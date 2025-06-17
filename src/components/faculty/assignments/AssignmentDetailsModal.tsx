// components/faculty/assignments/AssignmentDetailsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  FileText, 
  Users, 
  Award, 
  Clock, 
  Edit, 
  Download,
  CheckCircle,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AssignmentService from "@/services/assignment-service";
import { AssignmentWithDetails, SubmissionStatus, SubmissionWithDetails } from "@/interfaces/assignment/assignment-interface";


interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentWithDetails;
  onEdit: () => void;
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onEdit,
}) => {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeData, setGradeData] = useState({ grade: "", feedback: "" });
  const [activeTab, setActiveTab] = useState("overview");

  const assignmentService = AssignmentService.getInstance();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const submissionsData = await assignmentService.getAssignmentSubmissions(assignment._id);
      setSubmissions(submissionsData);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, assignment._id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDueDateStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "overdue", color: "text-red-600 bg-red-50", label: "Overdue" };
    } else if (diffDays <= 3) {
      return { status: "due-soon", color: "text-orange-600 bg-orange-50", label: `${diffDays} days left` };
    } else {
      return { status: "upcoming", color: "text-green-600 bg-green-50", label: `${diffDays} days left` };
    }
  };

  const getSubmissionStatusBadge = (submission: SubmissionWithDetails) => {
    if (submission.status === SubmissionStatus.GRADED) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Graded</Badge>;
    } else if (submission.isLate) {
      return <Badge variant="destructive">Late</Badge>;
    } else {
      return <Badge variant="secondary">Submitted</Badge>;
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!gradeData.grade || isNaN(Number(gradeData.grade))) {
      alert("Please enter a valid grade");
      return;
    }

    const grade = Number(gradeData.grade);
    if (grade < 0 || grade > assignment.maxScore) {
      alert(`Grade must be between 0 and ${assignment.maxScore}`);
      return;
    }

    try {
      await assignmentService.gradeSubmission(submissionId, {
        grade: grade,
        feedback: gradeData.feedback.trim() || undefined,
      });

      // Refresh submissions
      await fetchSubmissions();
      
      // Reset grading form
      setGradingSubmissionId(null);
      setGradeData({ grade: "", feedback: "" });
    } catch (error: any) {
      console.error("Error grading submission:", error);
      alert(error.message || "Failed to grade submission");
    }
  };

  const startGrading = (submission: SubmissionWithDetails) => {
    setGradingSubmissionId(submission._id);
    setGradeData({
      grade: submission.grade?.toString() || "",
      feedback: submission.feedback || "",
    });
  };

  const cancelGrading = () => {
    setGradingSubmissionId(null);
    setGradeData({ grade: "", feedback: "" });
  };

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case "text": return "Text Only";
      case "file_upload": return "File Upload Only";
      case "both": return "Text + File Upload";
      default: return type;
    }
  };

  const dueDateStatus = getDueDateStatus(assignment.dueDate);
  const submissionRate = assignment.submissionCount > 0 ? 
    Math.round((assignment.gradedCount / assignment.submissionCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("!max-w-[50vw] !w-[90vw] max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {assignment.title}
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Assignment
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions ({assignment.submissionCount})
            </TabsTrigger>
            <TabsTrigger value="grading">
              Grading ({assignment.gradedCount}/{assignment.submissionCount})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Assignment Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                      <p className={cn("text-xs px-2 py-1 rounded", dueDateStatus.color)}>
                        {dueDateStatus.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Max Score</p>
                      <p className="text-2xl font-bold text-gray-900">{assignment.maxScore}</p>
                      <p className="text-xs text-gray-500">{getAssignmentTypeLabel(assignment.assignmentType)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{assignment.submissionCount}</p>
                      <p className="text-xs text-gray-500">{submissionRate}% graded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Course</Label>
                    <p className="text-gray-900">{assignment.course.name} ({assignment.course.courseId})</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-gray-900">{assignment.description}</p>
                  </div>
                  
                  {assignment.instructions && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Instructions</Label>
                      <p className="text-gray-900 whitespace-pre-wrap">{assignment.instructions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <p className="text-gray-900 capitalize">{assignment.status}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="text-gray-900">{formatDate(assignment.createdAt)}</p>
                    </div>
                  </div>

                  {assignment.allowLateSubmission && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Late Submission</Label>
                      <p className="text-gray-900">
                        Allowed with {assignment.latePenalty}% penalty per day
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Submission Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Submissions</span>
                      <span className="font-medium">{assignment.submissionCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Graded</span>
                      <span className="font-medium text-green-600">{assignment.gradedCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Grading</span>
                      <span className="font-medium text-orange-600">
                        {assignment.submissionCount - assignment.gradedCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Grading Progress</span>
                      <span className="font-medium">{submissionRate}%</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${submissionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Submissions</span>
                  {submissions.length > 0 && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export All
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="text-gray-500">
                              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No submissions yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissions.map((submission) => (
                          <TableRow key={submission._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {submission.student.profile.firstName.charAt(0)}
                                    {submission.student.profile.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {submission.student.profile.firstName} {submission.student.profile.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">{submission.student.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{formatDate(submission.submittedAt)}</p>
                                {submission.isLate && (
                                  <p className="text-xs text-red-600">Late submission</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getSubmissionStatusBadge(submission)}
                            </TableCell>
                            <TableCell>
                              {submission.grade !== undefined ? (
                                <div>
                                  <p className="font-medium">
                                    {submission.grade}/{assignment.maxScore}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {Math.round((submission.grade / assignment.maxScore) * 100)}%
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => startGrading(submission)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grading" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Grading */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Grading</CardTitle>
                </CardHeader>
                <CardContent>
                  {gradingSubmissionId ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="grade">Grade (out of {assignment.maxScore})</Label>
                        <Input
                          id="grade"
                          type="number"
                          min="0"
                          max={assignment.maxScore}
                          value={gradeData.grade}
                          onChange={(e) => setGradeData(prev => ({ ...prev, grade: e.target.value }))}
                          placeholder="Enter grade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="feedback">Feedback (Optional)</Label>
                        <Textarea
                          id="feedback"
                          value={gradeData.feedback}
                          onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                          placeholder="Provide feedback to the student..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleGradeSubmission(gradingSubmissionId)}
                          size="sm"
                        >
                          Save Grade
                        </Button>
                        <Button variant="outline" size="sm" onClick={cancelGrading}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a submission to start grading</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grading Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Grading Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{assignment.gradedCount}</p>
                      <p className="text-sm text-gray-600">Graded</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">
                        {assignment.submissionCount - assignment.gradedCount}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>

                  {submissions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Submissions to Grade
                      </Label>
                      <div className="mt-2 space-y-2">
                        {submissions
                          .filter(s => s.status !== SubmissionStatus.GRADED)
                          .slice(0, 5)
                          .map((submission) => (
                            <div 
                              key={submission._id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                              onClick={() => startGrading(submission)}
                            >
                              <span className="text-sm">
                                {submission.student.profile.firstName} {submission.student.profile.lastName}
                              </span>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDetailsModal;