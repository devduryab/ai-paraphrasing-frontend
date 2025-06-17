"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  UserCheck,
  GraduationCap,
  Target,
  Star,
  Calendar,
  Mail,
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
import { Button } from "@/components/ui/button";
import EnhancedStatsCard from "./analytics/EnhancedStatsCard";
import {
  StudentProgressChart,
  TopCoursesChart,
} from "./analytics/AnalyticsCharts";
import { StudentAnalytics } from "@/interfaces/Admin/analytics/AdminDashboardAnalytics";
import AnalyticsService from "@/services/analytics-service";

const StudentDashboardContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = AnalyticsService.getInstance();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getStudentAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching student analytics:", error);
      setError(error.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCourseStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      full: { label: "Full", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getProgressPercentage = () => {
    if (!analytics) return 0;
    return Math.round((analytics.enrolledCoursesCount / 4) * 100);
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

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedStatsCard
          title="Enrolled Courses"
          value={analytics?.enrolledCoursesCount || 0}
          change={{
            value: "+1 course",
            type: "increase",
            period: "this month",
          }}
          icon={BookOpen}
          iconColor="text-blue-600"
          description="Currently enrolled"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Remaining Slots"
          value={analytics?.remainingSlots || 4}
          change={{
            value: `${analytics?.remainingSlots || 4} left`,
            type: analytics?.remainingSlots === 0 ? "neutral" : "increase",
            period: "out of 4 max",
          }}
          icon={Target}
          iconColor="text-green-600"
          description="Available for enrollment"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Available Courses"
          value={analytics?.availableCoursesCount || 0}
          icon={Users}
          iconColor="text-purple-600"
          description="Can enroll in these"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Academic Progress"
          value={`${getProgressPercentage()}%`}
          change={{
            value: `${analytics?.enrolledCoursesCount || 0}/4 courses`,
            type: "neutral",
            period: "completion",
          }}
          icon={TrendingUp}
          iconColor="text-orange-600"
          description="Course load progress"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentProgressChart 
          enrolledCount={analytics?.enrolledCoursesCount || 0}
          remainingSlots={analytics?.remainingSlots || 4}
          loading={loading}
        />
        <TopCoursesChart 
          data={analytics?.popularCourses || []} 
          loading={loading}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Enrolled Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              My Enrolled Courses ({analytics?.enrolledCoursesCount || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.myCourses && analytics.myCourses.length > 0 ? (
                  analytics.myCourses.map((course, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.name}</h4>
                          <p className="text-sm text-gray-600">{course.courseId}</p>
                        </div>
                        {getCourseStatusBadge(course.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrolledCount} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(course.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = '/student/courses'}
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Faculty Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              My Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.facultyOverview && analytics.facultyOverview.length > 0 ? (
                  analytics.facultyOverview.map((faculty, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {faculty.facultyName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{faculty.facultyName}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {faculty.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-blue-600">
                          {faculty.coursesCount} course{faculty.coursesCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">with you</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No faculty assigned yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Recommended Courses
            <Badge variant="secondary" className="ml-2">
              {analytics?.availableCoursesCount || 0} available
            </Badge>
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
                  <TableHead>Course Name</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Enrolled Students</TableHead>
                  <TableHead>Popularity</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.popularCourses && analytics.popularCourses.length > 0 ? (
                  analytics.popularCourses.slice(0, 5).map((course, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{course.courseName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {course.courseId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{course.enrolledCount}/{course.maxSlots}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${Math.min(course.enrollmentRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round(course.enrollmentRate)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = '/student/courses'}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No course recommendations available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Enrollment History & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Enrollment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.enrollmentHistory && analytics.enrollmentHistory.length > 0 ? (
                  analytics.enrollmentHistory.map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.courseName}</p>
                        <p className="text-sm text-gray-600">Enrolled on {formatDate(enrollment.enrollmentDate)}</p>
                      </div>
                      <Badge variant="default">
                        {enrollment.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No enrollment history yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progress Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Course Progress</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getProgressPercentage()}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {analytics?.enrolledCoursesCount || 0} out of 4 courses completed
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {analytics?.enrolledCoursesCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Enrolled</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {analytics?.remainingSlots || 4}
                    </p>
                    <p className="text-sm text-gray-600">Remaining</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = '/student/courses'}
                    disabled={analytics?.remainingSlots === 0}
                  >
                    {analytics?.remainingSlots === 0 ? 'Course Limit Reached' : 'Browse Available Courses'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/student/courses'}
                  >
                    View My Enrollments
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboardContent;