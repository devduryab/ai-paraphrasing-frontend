// components/student/courses/StudentCoursesTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Users, UserCheck, UserPlus, UserX, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/interfaces/course/course-interface";
import CourseService from "@/services/course-management-services";
import StudentCourseDetailsModal from "./StudentCourseDetailsModal";


const StudentCoursesTable: React.FC = () => {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledLoading, setEnrolledLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const courseService = CourseService.getInstance();

  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const fetchedCourses = await courseService.getAllCourses(filters);
      setAllCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setEnrolledLoading(true);
      const fetchedEnrolledCourses = await courseService.getStudentCourses();
      setEnrolledCourses(fetchedEnrolledCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setEnrolledLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    fetchAllCourses();
  }, [statusFilter]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(allCourses);
    }
  }, [searchTerm, allCourses]);

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const canEnroll = (course: Course) => {
    return (
      course.status === "active" &&
      course.availableSlots > 0 &&
      !isEnrolled(course._id) &&
      enrolledCourses.length < 4 // Max 4 courses per student
    );
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setActionLoading(courseId);
      await courseService.enrollInCourse(courseId);
      await fetchAllCourses();
      await fetchEnrolledCourses();
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      alert(error.message || "Failed to enroll in course");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (window.confirm("Are you sure you want to unenroll from this course?")) {
      try {
        setActionLoading(courseId);
        await courseService.unenrollFromCourse(courseId);
        await fetchAllCourses();
        await fetchEnrolledCourses();
      } catch (error: any) {
        console.error("Error unenrolling from course:", error);
        alert(error.message || "Failed to unenroll from course");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

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

  const getEnrollmentButton = (course: Course) => {
    const enrolled = isEnrolled(course._id);
    const isLoading = actionLoading === course._id;

    if (enrolled) {
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleUnenroll(course._id)}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          ) : (
            <UserX className="w-4 h-4" />
          )}
          Unenroll
        </Button>
      );
    }

    if (!canEnroll(course)) {
      const reason = course.status !== "active" 
        ? "Inactive" 
        : course.availableSlots <= 0 
        ? "Full" 
        : enrolledCourses.length >= 4 
        ? "Max courses reached" 
        : "Cannot enroll";

      return (
        <Button variant="secondary" size="sm" disabled>
          {reason}
        </Button>
      );
    }

    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => handleEnroll(course._id)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
        ) : (
          <UserPlus className="w-4 h-4" />
        )}
        Enroll
      </Button>
    );
  };

  if (loading && enrolledLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with enrollment stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                <p className="text-sm text-gray-600">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{allCourses.length}</p>
                <p className="text-sm text-gray-600">Available Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{4 - enrolledCourses.length}</p>
                <p className="text-sm text-gray-600">Remaining Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for All Courses and My Courses */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Enrolled Courses ({enrolledCourses.length})</TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* All Courses Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Available Slots</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No courses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.courseId}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {course.assignedFaculty?.map((faculty) => (
                              <div key={faculty._id} className="text-sm">
                                {faculty.profile?.firstName} {faculty.profile?.lastName}
                              </div>
                            )) || "No faculty assigned"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={course.availableSlots > 0 ? "text-green-600" : "text-red-600"}>
                            {course.availableSlots}/{course.maxSlots}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {getEnrollmentButton(course)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Enrolled Courses Tab */}
        <TabsContent value="enrolled" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Class Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        You are not enrolled in any courses yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrolledCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.courseId}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {course.assignedFaculty?.map((faculty) => (
                              <div key={faculty._id} className="text-sm">
                                {faculty.profile?.firstName} {faculty.profile?.lastName}
                              </div>
                            )) || "No faculty assigned"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {course.enrolledCount}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(course.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCourse(course)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUnenroll(course._id)}
                              disabled={actionLoading === course._id}
                              className="gap-2"
                            >
                              {actionLoading === course._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <UserX className="w-4 h-4" />
                              )}
                              Unenroll
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Details Modal */}
      {selectedCourse && (
        <StudentCourseDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          isEnrolled={isEnrolled(selectedCourse._id)}
          onEnroll={() => handleEnroll(selectedCourse._id)}
          onUnenroll={() => handleUnenroll(selectedCourse._id)}
          canEnroll={canEnroll(selectedCourse)}
          actionLoading={actionLoading === selectedCourse._id}
        />
      )}
    </div>
  );
};

export default StudentCoursesTable;