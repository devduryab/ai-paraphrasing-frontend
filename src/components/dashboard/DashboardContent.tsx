"use client";

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { DashboardContentProps } from "@/interfaces/dashboard/dashboardInterface";
import ChartCard from "./layout/Cards/ChartCard";
import SimpleBarChart from "./charts/SimpleBarChart";
import RecentActivityTable from "./tables/RecentActivityTable";
import StatsCard from "./layout/Cards/StatsCard";
import AdminDashboardContent from "./AdminDashboardContent";
import FacultyDashboardContent from "./FacultyDashboardContent";
import StudentDashboardContent from "./StudentDashboardContent";

const DashboardContent: React.FC<DashboardContentProps> = ({ userRole }) => {
  // Role-specific stats configuration
  const getStatsConfig = () => {
    switch (userRole) {
      case "student":
        return [
          {
            title: "Assignments Submitted",
            value: "12",
            change: {
              value: "+2.5%",
              type: "increase" as const,
              period: "vs last month",
            },
            icon: FileText,
            iconColor: "text-blue-600",
          },
          {
            title: "Average Score",
            value: "87.5%",
            change: {
              value: "+5.2%",
              type: "increase" as const,
              period: "vs last month",
            },
            icon: TrendingUp,
            iconColor: "text-green-600",
          },
          {
            title: "Courses Enrolled",
            value: "6",
            icon: BookOpen,
            iconColor: "text-purple-600",
          },
          {
            title: "Completed Tasks",
            value: "24",
            change: {
              value: "+12%",
              type: "increase" as const,
              period: "this week",
            },
            icon: CheckCircle,
            iconColor: "text-emerald-600",
          },
        ];

      case "faculty":
        return [
          {
            title: "Total Students",
            value: "156",
            change: {
              value: "+12%",
              type: "increase" as const,
              period: "vs last semester",
            },
            icon: Users,
            iconColor: "text-blue-600",
          },
          {
            title: "Assignments Created",
            value: "28",
            change: {
              value: "+5",
              type: "increase" as const,
              period: "this month",
            },
            icon: FileText,
            iconColor: "text-green-600",
          },
          {
            title: "Pending Reviews",
            value: "18",
            change: {
              value: "-3",
              type: "decrease" as const,
              period: "vs yesterday",
            },
            icon: AlertCircle,
            iconColor: "text-orange-600",
          },
          {
            title: "Average Grade",
            value: "84.2%",
            change: {
              value: "+2.1%",
              type: "increase" as const,
              period: "this semester",
            },
            icon: TrendingUp,
            iconColor: "text-purple-600",
          },
        ];

      case "super_admin":
        return [
          {
            title: "Total Sales",
            value: "$120,784.02",
            change: {
              value: "+15.3%",
              type: "increase" as const,
              period: "vs last month",
            },
            icon: DollarSign,
            iconColor: "text-blue-600",
          },
          {
            title: "Total Orders",
            value: "28,834",
            change: {
              value: "+20.1%",
              type: "increase" as const,
              period: "vs last month",
            },
            icon: ShoppingCart,
            iconColor: "text-green-600",
          },
          {
            title: "Total Users",
            value: "18,962",
            change: {
              value: "+201",
              type: "increase" as const,
              period: "vs yesterday",
            },
            icon: Users,
            iconColor: "text-purple-600",
          },
          {
            title: "Refunded",
            value: "2,976",
            change: {
              value: "+19%",
              type: "increase" as const,
              period: "vs last month",
            },
            icon: TrendingUp,
            iconColor: "text-orange-600",
          },
        ];

      default:
        return [];
    }
  };

  const getChartTitles = () => {
    switch (userRole) {
      case "student":
        return {
          barChart: "Assignment Scores",
          pieChart: "Course Progress",
        };
      case "faculty":
        return {
          barChart: "Student Performance",
          pieChart: "Assignment Types",
        };
      case "super_admin":
        return {
          barChart: "Revenue",
          pieChart: "Traffic Channel",
        };
      default:
        return {
          barChart: "Analytics",
          pieChart: "Distribution",
        };
    }
  };

  const getTableTitle = () => {
    switch (userRole) {
      case "student":
        return "Recent Submissions";
      case "faculty":
        return "Recent Student Activity";
      case "super_admin":
        return "Recent Activity";
      default:
        return "Recent Activity";
    }
  };

  const statsConfig = getStatsConfig();
  const chartTitles = getChartTitles();
  const tableTitle = getTableTitle();

  return (
    <div className="space-y-6">
      {userRole === "super_admin" ? (
        <AdminDashboardContent />
      ) : userRole === "faculty" ? (
        <FacultyDashboardContent />
      ) : userRole === "student" ? (
        <StudentDashboardContent />
      ) : (
        <>
          {/* Keep existing code for student role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                iconColor={stat.iconColor}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={chartTitles.barChart}
              subtitle="Monthly overview of performance metrics"
              className="lg:col-span-1"
            >
              <SimpleBarChart />
            </ChartCard>
          </div>

          <RecentActivityTable title={tableTitle} className="col-span-full" />
        </>
      )}
    </div>
  );
};

export default DashboardContent;
