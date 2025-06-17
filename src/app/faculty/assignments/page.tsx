// app/faculty/assignments/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import FacultyAssignmentDashboard from "@/components/faculty/assignments/FacultyAssignmentDashboard";

export default function FacultyAssignmentsPage() {
  return (
    <DashboardWrapper
      requiredRole="faculty"
      pageTitle="Assignment Management"
      pageSubtitle="Create and manage assignments for your courses."
    >
      <FacultyAssignmentDashboard />
    </DashboardWrapper>
  );
}