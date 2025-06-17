// components/faculty/courses/CourseDetailsModal.tsx
"use client";

import React from "react";
import { Users, Calendar, UserCheck, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/interfaces/course/course-interface";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      full: { label: "Full", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Course Details</DialogTitle>
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
                  <p className="text-sm text-gray-600">Maximum Slots</p>
                  <p className="font-medium">{course.maxSlots}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled Students</p>
                  <p className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    {course.enrolledCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p
                    className={`font-medium ${
                      course.availableSlots > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {course.availableSlots}
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

          {/* Assigned Faculty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Assigned Faculty ({course.assignedFaculty?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.assignedFaculty?.map((faculty) => (
                  <div
                    key={faculty._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {faculty.profile?.firstName || "N/A"}{" "}
                        {faculty.profile?.lastName || ""}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {faculty.email || "N/A"}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">
                    No faculty information available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Enrolled Students ({course.enrolledStudents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!course.enrolledStudents ||
              course.enrolledStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No students enrolled yet
                </p>
              ) : (
                <div className="space-y-3">
                  {course.enrolledStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {student.profile?.firstName || "N/A"}{" "}
                          {student.profile?.lastName || ""}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {student.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailsModal;
