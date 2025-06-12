"use client";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import { useAppSelector } from "@/store/hooks";

export default function StudentDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardWrapper
      requiredRole="student"
      pageTitle="Student Dashboard"
      pageSubtitle="Track your assignments and progress."
      showFilters={false}
      showExport={false}
    >
      <DashboardContent userRole="student" />
    </DashboardWrapper>
  );
}
