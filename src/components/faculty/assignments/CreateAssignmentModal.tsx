"use client";

import React, { useState } from "react";
import { Calendar, FileText, Clock, Award } from "lucide-react";
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
import AssignmentService from "@/services/assignment-service";
import { Course } from "@/interfaces/course/course-interface";
import {
  AssignmentStatus,
  AssignmentType,
  CreateAssignmentData,
} from "@/interfaces/assignment/assignment-interface";
import { cn } from "@/lib/utils";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courses: Course[];
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  courses,
}) => {
  const [formData, setFormData] = useState<CreateAssignmentData>({
    title: "",
    description: "",
    instructions: "",
    courseId: "",
    assignmentType: AssignmentType.BOTH,
    maxScore: 100,
    dueDate: "",
    allowLateSubmission: false,
    latePenalty: 0,
    status: AssignmentStatus.DRAFT,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateAssignmentData, string>>
  >({});
  const assignmentService = AssignmentService.getInstance();

  const handleInputChange = (field: keyof CreateAssignmentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Assignment title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Assignment description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.dueDate = "Due date must be in the future";
      }
    }

    if (formData.maxScore < 1 || formData.maxScore > 1000) {
      newErrors.maxScore = "Max score must be between 1 and 1000";
    }

    if (
      formData.allowLateSubmission &&
      ((formData.latePenalty ?? 0) < 0 || (formData.latePenalty ?? 0) > 100)
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
      await assignmentService.createAssignment(formData);

      // Reset form
      setFormData({
        title: "",
        description: "",
        instructions: "",
        courseId: "",
        assignmentType: AssignmentType.BOTH,
        maxScore: 100,
        dueDate: "",
        allowLateSubmission: false,
        latePenalty: 0,
        status: AssignmentStatus.DRAFT,
      });
      setErrors({});

      onSuccess();
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      alert(error.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: "",
        description: "",
        instructions: "",
        courseId: "",
        assignmentType: AssignmentType.BOTH,
        maxScore: 100,
        dueDate: "",
        allowLateSubmission: false,
        latePenalty: 0,
        status: AssignmentStatus.DRAFT,
      });
      setErrors({});
      onClose();
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("!max-w-[50vw] !w-[90vw] max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Assignment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Physics Chapter 5 Problems"
                  disabled={loading}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <Label>Select Course *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) =>
                    handleInputChange("courseId", value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger
                    className={errors.courseId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Choose a course for this assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{course.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({course.courseId})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-red-600 mt-1">{errors.courseId}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe what this assignment covers and its learning objectives..."
                  disabled={loading}
                  rows={3}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  placeholder="Provide detailed instructions for students on how to complete this assignment..."
                  disabled={loading}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Assignment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Assignment Configuration
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
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AssignmentType.TEXT}>
                        Text Only
                      </SelectItem>
                      <SelectItem value={AssignmentType.FILE_UPLOAD}>
                        File Upload Only
                      </SelectItem>
                      <SelectItem value={AssignmentType.BOTH}>
                        Text + File Upload
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Score */}
                <div>
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.maxScore}
                    onChange={(e) =>
                      handleInputChange(
                        "maxScore",
                        parseInt(e.target.value) || 1
                      )
                    }
                    disabled={loading}
                    className={errors.maxScore ? "border-red-500" : ""}
                  />
                  {errors.maxScore && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.maxScore}
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
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  min={getMinDateTime()}
                  disabled={loading}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>
                )}
              </div>

              {/* Late Submission Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="allowLateSubmission">
                      Allow Late Submissions
                    </Label>
                  </div>
                  <Switch
                    id="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowLateSubmission", checked)
                    }
                    disabled={loading}
                  />
                </div>

                {formData.allowLateSubmission && (
                  <div>
                    <Label htmlFor="latePenalty">
                      Late Penalty (% per day)
                    </Label>
                    <Input
                      id="latePenalty"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.latePenalty}
                      onChange={(e) =>
                        handleInputChange(
                          "latePenalty",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 10 for 10% penalty per day late"
                      disabled={loading}
                      className={errors.latePenalty ? "border-red-500" : ""}
                    />
                    {errors.latePenalty && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.latePenalty}
                      </p>
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
                  </SelectContent>
                </Select>
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
                  Creating...
                </div>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentModal;
