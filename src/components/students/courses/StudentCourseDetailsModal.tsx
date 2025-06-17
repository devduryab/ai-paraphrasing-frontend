// components/student/courses/StudentCourseDetailsModal.tsx
"use client";

import React from "react";
import { Users, Calendar, UserCheck, Mail, UserPlus, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/interfaces/course/course-interface";

interface StudentCourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  canEnroll: boolean;
  actionLoading: boolean;
}

const StudentCourseDetailsModal: React.FC<StudentCourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  isEnrolled,
  onEnroll,
  onUnenroll,
  canEnroll,
  actionLoading,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      full: { label: "Full", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEnrollmentButton = () => {
    if (isEnrolled) {
      return (
        <Button
          variant="destructive"
          onClick={onUnenroll}
          disabled={actionLoading}
          className="gap-2"
        >
          {actionLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <UserX className="w-4 h-4" />
          )}
          Unenroll from Course
        </Button>
      );
    }

    if (!canEnroll) {
      const reason = course.status !== "active" 
        ? "Course is not active" 
        : course.availableSlots <= 0 
        ? "Course is full" 
        : "Maximum courses reached (4 courses limit)";

      return (
        <Button variant="secondary" disabled>
          {reason}
        </Button>
      );
    }

    return (
      <Button
        onClick={onEnroll}
        disabled={actionLoading}
        className="gap-2"
      >
        {actionLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Enroll in Course
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Course Details</span>
            {isEnrolled && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <UserCheck className="w-3 h-3 mr-1" />
                Enrolled
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{course.name}</span>
                {getStatusBadge(course.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course ID</p>
                  <p className="font-medium">{course.courseId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className={`font-medium ${course.availableSlots > 0 ? "text-green-600" : "text-red-600"}`}>
                    {course.availableSlots} / {course.maxSlots}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Enrolled</p>
                  <p className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {course.enrolledCount} students
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Course Status</p>
                  <p className="font-medium">
                    {course.status === "active" ? "Open for enrollment" : 
                     course.status === "full" ? "Course is full" : "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created On</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(course.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(course.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Faculty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Course Faculty ({course.assignedFaculty?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!course.assignedFaculty || course.assignedFaculty.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No faculty assigned yet
                </p>
              ) : (
                <div className="space-y-3">
                  {course.assignedFaculty.map((faculty) => (
                    <div
                      key={faculty._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {faculty.profile?.firstName || 'N/A'} {faculty.profile?.lastName || ''}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {faculty.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Action */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Course Enrollment</h3>
                  <p className="text-sm text-gray-600">
                    {isEnrolled 
                      ? "You are currently enrolled in this course" 
                      : canEnroll 
                      ? "Click to enroll in this course" 
                      : "Enrollment not available"}
                  </p>
                </div>
                {getEnrollmentButton()}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {isEnrolled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Enrollment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p className="text-green-600 font-medium">✓ You are enrolled in this course</p>
                  <p className="text-gray-600">
                    You can access course materials and submit assignments for this course.
                  </p>
                  <p className="text-gray-600">
                    To unenroll, click the &quot;Unenroll from Course&quot; button above.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentCourseDetailsModal;