// components/admin/courses/CourseStudentsModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, UserX, Download, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, Student } from "@/interfaces/course/course-interface";
import CourseService from "@/services/course-management-services";
import { cn } from "@/lib/utils";

interface CourseStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onStudentRemoved: () => void;
}

const CourseStudentsModal: React.FC<CourseStudentsModalProps> = ({
  isOpen,
  onClose,
  course,
  onStudentRemoved,
}) => {
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);

  const courseService = CourseService.getInstance();

  // Fetch complete course details with populated students
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const details = await courseService.getCourseById(course._id);
      setCourseDetails(details);
      setFilteredStudents(details.enrolledStudents || []);
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCourseDetails();
    }
  }, [isOpen, course._id]);

  useEffect(() => {
    if (!courseDetails?.enrolledStudents) return;

    if (searchTerm.trim()) {
      const filtered = courseDetails.enrolledStudents.filter(
        (student) =>
          student.profile?.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.profile?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(courseDetails.enrolledStudents);
    }
  }, [searchTerm, courseDetails]);

  const handleRemoveStudent = async (
    studentId: string,
    studentName: string
  ) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${studentName} from this course?`
      )
    ) {
      try {
        setRemovingStudent(studentId);
        await courseService.removeStudentFromCourse(course._id, studentId);
        await fetchCourseDetails(); // Refresh the data
        onStudentRemoved(); // Refresh parent table
      } catch (error: any) {
        console.error("Error removing student:", error);
        alert(error.message || "Failed to remove student from course");
      } finally {
        setRemovingStudent(null);
      }
    }
  };

  const handleExportStudents = () => {
    if (
      !courseDetails?.enrolledStudents ||
      courseDetails.enrolledStudents.length === 0
    ) {
      alert("No students to export");
      return;
    }

    const csvContent = [
      ["Name", "Email", "Phone", "Enrollment Date"],
      ...courseDetails.enrolledStudents.map((student) => [
        `${student.profile?.firstName || ""} ${
          student.profile?.lastName || ""
        }`.trim(),
        student.email || "",
        student.profile?.phone || "N/A",
        new Date().toLocaleDateString(), // You might want to add actual enrollment date to your backend
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${course.courseId}_students.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("!max-w-[50vw] !w-[90vw] max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>Students in {course.name}</span>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Course ID: {course.courseId}
              </p>
            </div>
            <Badge variant="default" className="text-sm">
              {courseDetails?.enrolledStudents?.length || 0} Students
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Slots</p>
                  <p className="font-medium">{course.maxSlots}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled Students</p>
                  <p className="font-medium text-blue-600">
                    {courseDetails?.enrolledStudents?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p
                    className={`font-medium ${
                      (courseDetails?.availableSlots || 0) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {courseDetails?.availableSlots || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fill Rate</p>
                  <p className="font-medium">
                    {course.maxSlots > 0
                      ? Math.round(
                          ((courseDetails?.enrolledStudents?.length || 0) /
                            course.maxSlots) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enrolled Students</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportStudents}
                  disabled={
                    !courseDetails?.enrolledStudents ||
                    courseDetails.enrolledStudents.length === 0
                  }
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-gray-500"
                        >
                          {courseDetails?.enrolledStudents?.length === 0
                            ? "No students enrolled in this course yet"
                            : "No students found matching your search"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {(student.profile?.firstName?.charAt(0) ||
                                    "") +
                                    (student.profile?.lastName?.charAt(0) ||
                                      "")}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {student.profile?.firstName || "N/A"}{" "}
                                  {student.profile?.lastName || ""}
                                </p>
                                <p className="text-sm text-gray-500">Student</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {student.email || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {student.profile?.phone || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(
                                courseDetails?.createdAt ||
                                  new Date().toISOString()
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveStudent(
                                  student._id,
                                  `${student.profile?.firstName || ""} ${
                                    student.profile?.lastName || ""
                                  }`.trim()
                                )
                              }
                              disabled={removingStudent === student._id}
                              className="text-red-600 hover:text-red-700 gap-2"
                            >
                              {removingStudent === student._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {courseDetails?.enrolledStudents &&
            courseDetails.enrolledStudents.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Showing {filteredStudents.length} of{" "}
                      {courseDetails.enrolledStudents.length} enrolled students
                    </span>
                    <span>
                      Course capacity: {courseDetails.enrolledStudents.length}/
                      {course.maxSlots}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseStudentsModal;
