// components/faculty/assignments/EditAssignmentModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Calendar, FileText, Clock, Award, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AssignmentService from "@/services/assignment-service";
import { AssignmentStatus, AssignmentType, AssignmentWithDetails, UpdateAssignmentData } from "@/interfaces/assignment/assignment-interface";
import { cn } from "@/lib/utils";


interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment: AssignmentWithDetails;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}) => {
  const [formData, setFormData] = useState<UpdateAssignmentData>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmissions, setHasSubmissions] = useState(false);

  const assignmentService = AssignmentService.getInstance();

  // Initialize form data when modal opens or assignment changes
  useEffect(() => {
    if (isOpen && assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions || "",
        assignmentType: assignment.assignmentType,
        maxScore: assignment.maxScore,
        dueDate: assignment.dueDate.slice(0, 16), // Format for datetime-local input
        allowLateSubmission: assignment.allowLateSubmission,
        latePenalty: assignment.latePenalty || 0,
        status: assignment.status,
      });
      setHasSubmissions(assignment.submissionCount > 0);
      setErrors({});
    }
  }, [isOpen, assignment]);

  const handleInputChange = (field: keyof UpdateAssignmentData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.title && !formData.title.trim()) {
      newErrors.title = "Assignment title cannot be empty";
    } else if (formData.title && formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (formData.description && !formData.description.trim()) {
      newErrors.description = "Assignment description cannot be empty";
    } else if (formData.description && formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = "Due date must be in the future";
      }
    }

    if (formData.maxScore !== undefined && (formData.maxScore < 1 || formData.maxScore > 1000)) {
      newErrors.maxScore = "Max score must be between 1 and 1000";
    }

    if (
      formData.allowLateSubmission &&
      formData.latePenalty !== undefined &&
      (formData.latePenalty < 0 || formData.latePenalty > 100)
    ) {
      newErrors.latePenalty = "Late penalty must be between 0 and 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await assignmentService.updateAssignment(assignment._id, formData);
      onSuccess();
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      alert(error.message || "Failed to update assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("!max-w-[50vw] !w-[90vw] max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Edit Assignment
          </DialogTitle>
        </DialogHeader>

        {/* Warning about submissions */}
        {hasSubmissions && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This assignment has {assignment.submissionCount} submission{assignment.submissionCount !== 1 ? 's' : ''}. 
              Some changes (like assignment type and max score) may be restricted.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Information</CardTitle>
              <p className="text-sm text-gray-600">
                Course: {assignment.course.name} ({assignment.course.courseId})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Physics Chapter 5 Problems"
                  disabled={loading}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this assignment covers..."
                  disabled={loading}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions || ""}
                  onChange={(e) => handleInputChange("instructions", e.target.value)}
                  placeholder="Provide detailed instructions..."
                  disabled={loading}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assignment Type */}
                <div>
                  <Label>Submission Type</Label>
                  <Select
                    value={formData.assignmentType}
                    onValueChange={(value: AssignmentType) => 
                      handleInputChange("assignmentType", value)
                    }
                    disabled={loading || hasSubmissions} // Disable if has submissions
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AssignmentType.TEXT}>Text Only</SelectItem>
                      <SelectItem value={AssignmentType.FILE_UPLOAD}>File Upload Only</SelectItem>
                      <SelectItem value={AssignmentType.BOTH}>Text + File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasSubmissions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cannot change submission type after students have submitted
                    </p>
                  )}
                </div>

                {/* Max Score */}
                <div>
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxScore || ""}
                    onChange={(e) => handleInputChange("maxScore", parseInt(e.target.value) || 1)}
                    disabled={loading || hasSubmissions} // Disable if has submissions
                    className={errors.maxScore ? "border-red-500" : ""}
                  />
                  {errors.maxScore && (
                    <p className="text-sm text-red-600 mt-1">{errors.maxScore}</p>
                  )}
                  {hasSubmissions && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cannot change max score after submissions exist
                    </p>
                  )}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date & Time *
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate || ""}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  min={getMinDateTime()}
                  disabled={loading}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Current: {formatDateForDisplay(assignment.dueDate)}
                </p>
              </div>

              {/* Late Submission Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="allowLateSubmission">Allow Late Submissions</Label>
                  </div>
                  <Switch
                    id="allowLateSubmission"
                    checked={formData.allowLateSubmission || false}
                    onCheckedChange={(checked) => handleInputChange("allowLateSubmission", checked)}
                    disabled={loading}
                  />
                </div>

                {formData.allowLateSubmission && (
                  <div>
                    <Label htmlFor="latePenalty">Late Penalty (% per day)</Label>
                    <Input
                      id="latePenalty"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.latePenalty || 0}
                      onChange={(e) => handleInputChange("latePenalty", parseInt(e.target.value) || 0)}
                      placeholder="e.g., 10 for 10% penalty per day late"
                      disabled={loading}
                      className={errors.latePenalty ? "border-red-500" : ""}
                    />
                    {errors.latePenalty && (
                      <p className="text-sm text-red-600 mt-1">{errors.latePenalty}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <Label>Assignment Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: AssignmentStatus) => 
                    handleInputChange("status", value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AssignmentStatus.DRAFT}>
                      Draft - Not visible to students
                    </SelectItem>
                    <SelectItem value={AssignmentStatus.ACTIVE}>
                      Active - Students can submit
                    </SelectItem>
                    <SelectItem value={AssignmentStatus.ARCHIVED}>
                      Archived - Closed for submissions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{assignment.submissionCount}</p>
                  <p className="text-sm text-gray-600">Submissions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{assignment.gradedCount}</p>
                  <p className="text-sm text-gray-600">Graded</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {assignment.submissionCount - assignment.gradedCount}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {assignment.submissionCount > 0 
                      ? Math.round((assignment.gradedCount / assignment.submissionCount) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Grading Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Assignment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentModal;