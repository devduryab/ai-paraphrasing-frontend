// app/student/submissions/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import StudentSubmissionsTable from "@/components/students/submissions/StudentSubmissionsTable";

export default function StudentSubmissionsPage() {
  return (
    <DashboardWrapper
      requiredRole="student"
      pageTitle="My Submissions"
      pageSubtitle="Track your submitted assignments and view grades."
    >
      <StudentSubmissionsTable />
    </DashboardWrapper>
  );
}