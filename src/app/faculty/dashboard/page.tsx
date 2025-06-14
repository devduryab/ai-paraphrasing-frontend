"use client";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import { useAppSelector } from "@/store/hooks";

export default function FacultyDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardWrapper
      requiredRole="faculty"
      pageTitle="Faculty Dashboard"
      pageSubtitle="Manage your students and assignments."
     
    >
      <DashboardContent userRole="faculty" />
    </DashboardWrapper>
  );
}
