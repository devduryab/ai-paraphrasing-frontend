// app/student/assignments/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import StudentAssignmentDashboard from "@/components/students/assignments/StudentAssignmentDashboard";

export default function StudentAssignmentsPage() {
  return (
    <DashboardWrapper
      requiredRole="student"
      pageTitle="My Assignments"
      pageSubtitle="View and submit your course assignments."
    >
      <StudentAssignmentDashboard />
    </DashboardWrapper>
  );
}