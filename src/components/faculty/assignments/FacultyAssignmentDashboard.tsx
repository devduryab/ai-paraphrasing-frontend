"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssignmentService from "@/services/assignment-service";

import EnhancedStatsCard from "@/components/dashboard/analytics/EnhancedStatsCard";
import {
  AssignmentStats,
  AssignmentStatus,
  AssignmentWithDetails,
} from "@/interfaces/assignment/assignment-interface";
import { Course } from "@/interfaces/course/course-interface";
import CourseService from "@/services/course-management-services";
import CreateAssignmentModal from "./CreateAssignmentModal";
import AssignmentTable from "./AssignmentTable";

const FacultyAssignmentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    AssignmentStatus | "all"
  >("all");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  const assignmentService = AssignmentService.getInstance();
  const courseService = CourseService.getInstance();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAllAssignments({
          courseId: selectedCourse !== "all" ? selectedCourse : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          search: searchTerm.trim() || undefined,
        }),
        courseService.getFacultyCourses(),
      ]);

      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await assignmentService.getAssignmentStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCourse, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchData();
      } else if (searchTerm === "") {
        fetchData();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleAssignmentCreated = () => {
    fetchData();
    fetchStats();
    setShowCreateModal(false);
  };

  const handleAssignmentDeleted = () => {
    fetchData();
    fetchStats();
  };

  const getSubmissionRate = () => {
    if (!stats || stats.totalAssignments === 0) return 0;
    return Math.round(
      (stats.totalSubmissions / (stats.totalAssignments * 10)) * 100
    ); // Assuming avg 10 students per assignment
  };

  const getGradingProgress = () => {
    if (!stats || stats.totalSubmissions === 0) return 0;
    return Math.round((stats.gradedSubmissions / stats.totalSubmissions) * 100);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-end">
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
          disabled={courses.length === 0}
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatsCard
          title="Total Assignments"
          value={stats?.totalAssignments || 0}
          change={{
            value: `${stats?.activeAssignments || 0} active`,
            type: "neutral",
            period: "assignments",
          }}
          icon={FileText}
          iconColor="text-blue-600"
          description="All created assignments"
          loading={statsLoading}
        />

        <EnhancedStatsCard
          title="Total Submissions"
          value={stats?.totalSubmissions || 0}
          change={{
            value: `${getSubmissionRate()}%`,
            type: getSubmissionRate() > 70 ? "increase" : "neutral",
            period: "submission rate",
          }}
          icon={Users}
          iconColor="text-green-600"
          description="Student submissions received"
          loading={statsLoading}
        />

        <EnhancedStatsCard
          title="Pending Grading"
          value={stats?.pendingGrading || 0}
          change={{
            value: `${getGradingProgress()}%`,
            type: getGradingProgress() > 80 ? "increase" : "neutral",
            period: "graded",
          }}
          icon={Clock}
          iconColor="text-orange-600"
          description="Submissions awaiting grades"
          loading={statsLoading}
        />

        <EnhancedStatsCard
          title="Average Grade"
          value={
            stats?.averageGrade ? `${Math.round(stats.averageGrade)}%` : "N/A"
          }
          change={{
            value: `${stats?.gradedSubmissions || 0} graded`,
            type: "neutral",
            period: "submissions",
          }}
          icon={CheckCircle}
          iconColor="text-purple-600"
          description="Across all assignments"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assignments by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Course Filter */}
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

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as AssignmentStatus | "all")
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={AssignmentStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={AssignmentStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={AssignmentStatus.ARCHIVED}>
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      <AssignmentTable
        assignments={assignments}
        loading={loading}
        onAssignmentDeleted={handleAssignmentDeleted}
        onAssignmentUpdated={() => {
          fetchData();
          fetchStats();
        }}
      />

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleAssignmentCreated}
        courses={courses}
      />

      {/* No courses message */}
      {courses.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Courses Assigned
            </h3>
            <p className="text-gray-600 mb-4">
              You need to be assigned to courses before you can create
              assignments.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator to get assigned to courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyAssignmentDashboard;
