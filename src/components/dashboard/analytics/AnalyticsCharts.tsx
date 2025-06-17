"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Growth Trend Chart
interface GrowthChartProps {
  data: Array<{
    month: string;
    students: number;
    faculty: number;
    courses: number;
  }>;
  loading?: boolean;
}

export const GrowthTrendChart: React.FC<GrowthChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="students"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Students"
            />
            <Line
              type="monotone"
              dataKey="faculty"
              stroke="#10B981"
              strokeWidth={2}
              name="Faculty"
            />
            <Line
              type="monotone"
              dataKey="courses"
              stroke="#F59E0B"
              strokeWidth={2}
              name="Courses"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Enrollment Trends Chart
interface EnrollmentTrendChartProps {
  data: Array<{
    month: string;
    enrollments: number;
  }>;
  loading?: boolean;
}

export const EnrollmentTrendChart: React.FC<EnrollmentTrendChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Enrollments</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Top Courses Chart
interface TopCoursesChartProps {
  data: Array<{
    courseId: string;
    courseName: string;
    enrolledCount: number;
    maxSlots: number;
    enrollmentRate: number;
  }>;
  loading?: boolean;
}

export const TopCoursesChart: React.FC<TopCoursesChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Enrolled Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="courseName" type="category" width={100} />
            <Tooltip
              formatter={(value: any, name: string) => [
                `${value} students`,
                name === "enrolledCount" ? "Enrolled" : name,
              ]}
            />
            <Bar dataKey="enrolledCount" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Course Capacity Chart
interface CourseCapacityChartProps {
  data: Array<{
    courseId: string;
    courseName: string;
    utilized: number;
    available: number;
    utilizationRate: number;
  }>;
  loading?: boolean;
}

export const CourseCapacityChart: React.FC<CourseCapacityChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Capacity Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 8).map((course) => ({
    name: course.courseId,
    fullName: course.courseName,
    utilized: course.utilized,
    available: course.available,
    utilizationRate: Math.round(course.utilizationRate),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Capacity Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: string) => [
                `${value} ${name === "utilized" ? "students" : "slots"}`,
                name === "utilized" ? "Enrolled" : "Available",
              ]}
            />
            <Bar
              dataKey="utilized"
              stackId="a"
              fill="#3B82F6"
              name="Enrolled"
            />
            <Bar
              dataKey="available"
              stackId="a"
              fill="#E5E7EB"
              name="Available"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Faculty Course Performance Chart
interface FacultyCoursePerformanceProps {
  data: Array<{
    courseId: string;
    courseName: string;
    enrolledCount: number;
    maxSlots: number;
    status: string;
  }>;
  loading?: boolean;
}

export const FacultyCoursePerformanceChart: React.FC<
  FacultyCoursePerformanceProps
> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((course) => ({
    name: course.courseId,
    fullName: course.courseName,
    enrolledCount: course.enrolledCount,
    maxSlots: course.maxSlots,
    fillRate: Math.round((course.enrolledCount / course.maxSlots) * 100),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses Enrollment</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: any, name: string) => [
                name === "fillRate" ? `${value}%` : `${value} students`,
                name === "enrolledCount"
                  ? "Enrolled"
                  : name === "maxSlots"
                  ? "Capacity"
                  : "Fill Rate",
              ]}
            />
            <Bar dataKey="enrolledCount" fill="#3B82F6" name="Enrolled" />
            <Bar dataKey="maxSlots" fill="#E5E7EB" name="Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Student Progress Chart
interface StudentProgressChartProps {
  enrolledCount: number;
  remainingSlots: number;
  loading?: boolean;
}

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  enrolledCount,
  remainingSlots,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: "Enrolled", value: enrolledCount, color: "#3B82F6" },
    { name: "Remaining", value: remainingSlots, color: "#E5E7EB" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Enrollment Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-4 mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-600">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
