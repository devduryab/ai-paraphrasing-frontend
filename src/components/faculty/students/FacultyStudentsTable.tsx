// components/faculty/students/FacultyStudentsTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Users, BookOpen, Mail } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/interfaces/course/course-interface";
import CourseService from "@/services/course-management-services";


interface StudentEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseId: string;
  courseObjectId: string;
}

const FacultyStudentsTable: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [filteredStudents, setFilteredStudents] = useState<StudentEnrollment[]>([]);

  const courseService = CourseService.getInstance();

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      // Get faculty's assigned courses
      const facultyCourses = await courseService.getFacultyCourses();
      setCourses(facultyCourses);

      // Get detailed course information for each course
      const allStudents: StudentEnrollment[] = [];
      
      for (const course of facultyCourses) {
        try {
          const courseDetails = await courseService.getCourseById(course._id);
          
          // Extract students from each course
          if (courseDetails.enrolledStudents && courseDetails.enrolledStudents.length > 0) {
            courseDetails.enrolledStudents.forEach(student => {
              allStudents.push({
                studentId: student._id,
                studentName: `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.trim(),
                studentEmail: student.email || '',
                courseName: course.name,
                courseId: course.courseId,
                courseObjectId: course._id,
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching details for course ${course._id}:`, error);
        }
      }

      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(student => student.courseObjectId === selectedCourse);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.courseId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedCourse, students]);

  const getUniqueStudentsCount = () => {
    const uniqueStudents = new Set(filteredStudents.map(s => s.studentId));
    return uniqueStudents.size;
  };

  const getTotalEnrollments = () => {
    return filteredStudents.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{getUniqueStudentsCount()}</p>
                <p className="text-sm text-gray-600">Unique Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                <p className="text-sm text-gray-600">My Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalEnrollments()}</p>
                <p className="text-sm text-gray-600">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} ({course.courseId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Students Overview</span>
            <span className="text-sm font-normal text-gray-600">
              Showing {filteredStudents.length} enrollment{filteredStudents.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrolled Course</TableHead>
                <TableHead>Course ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {students.length === 0 
                      ? "No students enrolled in your courses yet" 
                      : "No students found matching your filters"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={`${student.studentId}-${student.courseObjectId}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.studentName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.studentName || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Student</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {student.studentEmail || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        {student.courseName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {student.courseId}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Information */}
      {filteredStudents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Displaying {filteredStudents.length} student enrollment{filteredStudents.length !== 1 ? 's' : ''} 
                {selectedCourse !== "all" && ` in selected course`}
              </span>
              <span>
                {getUniqueStudentsCount()} unique student{getUniqueStudentsCount() !== 1 ? 's' : ''} across {courses.length} course{courses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyStudentsTable;