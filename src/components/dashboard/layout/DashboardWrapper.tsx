"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { DashboardWrapperProps } from "@/interfaces/dashboard/dashboardInterface";

export default function DashboardWrapper({
  children,
  requiredRole,
  pageTitle,
  pageSubtitle,
  showFilters = true,
  showExport = true,
}: DashboardWrapperProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Check if user has required role
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard
      const dashboardRoutes = {
        student: "/student/dashboard",
        faculty: "/faculty/dashboard",
        super_admin: "/admin/dashboard",
      };
      router.push(dashboardRoutes[user.role]);
      return;
    }
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole={user.role as "student" | "faculty" | "super_admin"}
      pageTitle={pageTitle}
      pageSubtitle={pageSubtitle}
      user={{
        name: user.profile.firstName + " " + user.profile.lastName,
        role: user.role,
        avatar: user.avatar,
      }}
      showFilters={showFilters}
      showExport={showExport}
    >
      {children}
    </DashboardLayout>
  );
}
