"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EnhancedStatsCard from "./analytics/EnhancedStatsCard";
import {
  EnrollmentTrendChart,
  FacultyCoursePerformanceChart,
  CourseCapacityChart,
} from "./analytics/AnalyticsCharts";
import { FacultyAnalytics } from "@/interfaces/Admin/analytics/AdminDashboardAnalytics";
import AnalyticsService from "@/services/analytics-service";

const FacultyDashboardContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = AnalyticsService.getInstance();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getFacultyAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching faculty analytics:", error);
      setError(error.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCourseStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      full: { label: "Full", variant: "destructive" as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBestPerformingCourse = () => {
    if (
      !analytics?.coursePerformance ||
      analytics.coursePerformance.length === 0
    ) {
      return { name: "N/A", rate: 0 };
    }

    const best = analytics.coursePerformance.reduce((prev, current) => {
      const prevRate =
        prev.maxSlots > 0 ? (prev.enrolledCount / prev.maxSlots) * 100 : 0;
      const currentRate =
        current.maxSlots > 0
          ? (current.enrolledCount / current.maxSlots) * 100
          : 0;
      return currentRate > prevRate ? current : prev;
    });

    return {
      name: best.courseName,
      rate:
        best.maxSlots > 0
          ? Math.round((best.enrolledCount / best.maxSlots) * 100)
          : 0,
    };
  };

  const getWorstPerformingCourse = () => {
    if (
      !analytics?.coursePerformance ||
      analytics.coursePerformance.length === 0
    ) {
      return { name: "N/A", rate: 0 };
    }

    const worst = analytics.coursePerformance.reduce((prev, current) => {
      const prevRate =
        prev.maxSlots > 0 ? (prev.enrolledCount / prev.maxSlots) * 100 : 0;
      const currentRate =
        current.maxSlots > 0
          ? (current.enrolledCount / current.maxSlots) * 100
          : 0;
      return currentRate < prevRate ? current : prev;
    });

    return {
      name: worst.courseName,
      rate:
        worst.maxSlots > 0
          ? Math.round((worst.enrolledCount / worst.maxSlots) * 100)
          : 0,
    };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bestCourse = getBestPerformingCourse();
  const worstCourse = getWorstPerformingCourse();

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatsCard
          title="My Courses"
          value={analytics?.totalAssignedCourses || 0}
          change={{
            value: "+2 courses",
            type: "increase",
            period: "this semester",
          }}
          icon={BookOpen}
          iconColor="text-blue-600"
          description="Total assigned courses"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Total Students"
          value={analytics?.totalStudentsAcrossCourses || 0}
          change={{
            value: "+15 students",
            type: "increase",
            period: "this month",
          }}
          icon={Users}
          iconColor="text-green-600"
          description="Across all my courses"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Enrollment Rate"
          value={`${Math.round(analytics?.averageEnrollmentRate || 0)}%`}
          change={{
            value: "+5.2%",
            type: "increase",
            period: "vs last month",
          }}
          icon={TrendingUp}
          iconColor="text-purple-600"
          description="Average course capacity"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Best Course"
          value={`${bestCourse.rate}%`}
          icon={Award}
          iconColor="text-orange-600"
          description={bestCourse.name}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendChart
          data={analytics?.enrollmentTrends || []}
          loading={loading}
        />
        <FacultyCoursePerformanceChart
          data={analytics?.coursePerformance || []}
          loading={loading}
        />
      </div>

      {/* Course Capacity Chart */}
      <div className="grid grid-cols-1 gap-6">
        <CourseCapacityChart
          data={
            analytics?.coursePerformance?.map((course) => ({
              courseId: course.courseId,
              courseName: course.courseName,
              utilized: course.enrolledCount,
              available: course.maxSlots - course.enrolledCount,
              utilizationRate:
                course.maxSlots > 0
                  ? (course.enrolledCount / course.maxSlots) * 100
                  : 0,
            })) || []
          }
          loading={loading}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Student Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.recentEnrollments &&
                  analytics.recentEnrollments.length > 0 ? (
                    analytics.recentEnrollments
                      .slice(0, 5)
                      .map((enrollment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {enrollment.studentName}
                                </p>
                                <p className="text-sm text-gray-500">Student</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {enrollment.courseName}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(enrollment.enrollmentDate)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-8 text-gray-500"
                      >
                        No recent enrollments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Course Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Course Performance Summary */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Performance Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Best Performing
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-green-600">
                          {bestCourse.rate}%
                        </span>
                        <p className="text-xs text-gray-500">
                          {bestCourse.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Needs Attention
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-red-600">
                          {worstCourse.rate}%
                        </span>
                        <p className="text-xs text-gray-500">
                          {worstCourse.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Course Status Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Course Status
                  </h4>
                  <div className="space-y-2">
                    {analytics?.coursePerformance?.map((course, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-600">
                          {course.courseName}
                        </span>
                        {getCourseStatusBadge(course.status)}
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">
                        No courses assigned
                      </p>
                    )}
                  </div>
                </div>

                <hr />

                {/* Teaching Load */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Teaching Load
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Average Students/Course
                      </span>
                      <span className="font-medium text-blue-600">
                        {analytics?.totalAssignedCourses &&
                        analytics.totalAssignedCourses > 0
                          ? Math.round(
                              analytics.totalStudentsAcrossCourses /
                                analytics.totalAssignedCourses
                            )
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Total Teaching Load
                      </span>
                      <span className="font-medium text-purple-600">
                        {analytics?.totalStudentsAcrossCourses || 0} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Course Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            My Courses Performance
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
                  <TableHead>Course</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Fill Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.coursePerformance &&
                analytics.coursePerformance.length > 0 ? (
                  analytics.coursePerformance.map((course, index) => {
                    const fillRate =
                      course.maxSlots > 0
                        ? Math.round(
                            (course.enrolledCount / course.maxSlots) * 100
                          )
                        : 0;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {course.courseName}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {course.courseId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {course.enrolledCount}
                          </span>
                        </TableCell>
                        <TableCell>{course.maxSlots}</TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              fillRate >= 80
                                ? "text-green-600"
                                : fillRate >= 50
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {fillRate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {getCourseStatusBadge(course.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No courses assigned yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyDashboardContent;
