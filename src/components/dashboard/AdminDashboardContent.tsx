"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  UserCheck,
  Clock,
  Activity,
  BarChart3,
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
  GrowthTrendChart,
  EnrollmentTrendChart,
  TopCoursesChart,
  CourseCapacityChart,
} from "./analytics/AnalyticsCharts";
import { AdminAnalytics } from "@/interfaces/Admin/analytics/AdminDashboardAnalytics";
import AnalyticsService from "@/services/analytics-service";

const AdminDashboardContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const analyticsService = AnalyticsService.getInstance();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAdminAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching admin analytics:", error);
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

  const getUserStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      inactive: { label: "Inactive", variant: "secondary" as const },
      suspended: { label: "Suspended", variant: "destructive" as const },
      pending: { label: "Pending", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
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
          title="Total Users"
          value={analytics?.totalUsers || 0}
          change={{
            value: "+12.5%",
            type: "increase",
            period: "vs last month",
          }}
          icon={Users}
          iconColor="text-blue-600"
          description={`${analytics?.totalStudents || 0} students, ${analytics?.totalFaculty || 0} faculty`}
          loading={loading}
        />

        <EnhancedStatsCard
          title="Total Courses"
          value={analytics?.totalCourses || 0}
          change={{
            value: "+8.2%",
            type: "increase",
            period: "vs last month",
          }}
          icon={BookOpen}
          iconColor="text-green-600"
          description={`${analytics?.activeCourses || 0} active, ${analytics?.fullCourses || 0} full`}
          loading={loading}
        />

        <EnhancedStatsCard
          title="Total Enrollments"
          value={analytics?.totalEnrollments || 0}
          change={{
            value: "+15.3%",
            type: "increase",
            period: "vs last month",
          }}
          icon={UserCheck}
          iconColor="text-purple-600"
          description="Across all courses"
          loading={loading}
        />

        <EnhancedStatsCard
          title="Enrollment Rate"
          value={`${Math.round(analytics?.averageEnrollmentRate || 0)}%`}
          change={{
            value: "+2.1%",
            type: "increase",
            period: "vs last month",
          }}
          icon={TrendingUp}
          iconColor="text-orange-600"
          description="Average course capacity"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthTrendChart 
          data={analytics?.userGrowthData || []} 
          loading={loading}
        />
        <EnrollmentTrendChart 
          data={analytics?.enrollmentTrends || []} 
          loading={loading}
        />
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCoursesChart 
          data={analytics?.topCourses || []} 
          loading={loading}
        />
        <CourseCapacityChart 
          data={analytics?.courseCapacityData || []} 
          loading={loading}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Registrations
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
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.recentUsers.slice(0, 5).map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.profile.firstName} {user.profile.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">
                          {user.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getUserStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Course Status Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Course Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Courses</span>
                      <span className="font-medium text-green-600">
                        {analytics?.activeCourses || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Full Courses</span>
                      <span className="font-medium text-red-600">
                        {analytics?.fullCourses || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Inactive Courses</span>
                      <span className="font-medium text-gray-600">
                        {analytics?.inactiveCourses || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <hr />

                {/* User Breakdown */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">User Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Students</span>
                      <span className="font-medium text-blue-600">
                        {analytics?.totalStudents || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Faculty</span>
                      <span className="font-medium text-green-600">
                        {analytics?.totalFaculty || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Users</span>
                      <span className="font-medium text-gray-900">
                        {analytics?.totalUsers || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Quick Stats */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Enrollment Rate</span>
                      <span className="font-medium text-purple-600">
                        {Math.round(analytics?.averageEnrollmentRate || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Enrollments</span>
                      <span className="font-medium text-blue-600">
                        {analytics?.totalEnrollments || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(analytics?.averageEnrollmentRate || 0)}%
                </div>
                <p className="text-sm text-gray-600">System Utilization</p>
                <p className="text-xs text-gray-500 mt-1">
                  Course capacity being used
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.totalStudents && analytics?.totalFaculty 
                    ? Math.round(analytics.totalStudents / analytics.totalFaculty) 
                    : 0}:1
                </div>
                <p className="text-sm text-gray-600">Student-Faculty Ratio</p>
                <p className="text-xs text-gray-500 mt-1">
                  Students per faculty member
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics?.totalCourses && analytics?.totalFaculty 
                    ? Math.round((analytics.totalCourses / analytics.totalFaculty) * 10) / 10
                    : 0}
                </div>
                <p className="text-sm text-gray-600">Courses per Faculty</p>
                <p className="text-xs text-gray-500 mt-1">
                  Average teaching load
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardContent;