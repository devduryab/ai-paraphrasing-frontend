"use client";

import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import { useAppSelector } from "@/store/hooks";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <DashboardWrapper
      requiredRole="super_admin"
      pageTitle="Admin Dashboard"
      pageSubtitle="Manage your application settings and user data"
      
    >
      <DashboardContent userRole="super_admin" />
    </DashboardWrapper>
  );
}
