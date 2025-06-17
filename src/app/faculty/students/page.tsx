// app/faculty/students/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import FacultyStudentsTable from "@/components/faculty/students/FacultyStudentsTable";

export default function FacultyStudentsPage() {
  return (
    <DashboardWrapper
      requiredRole="faculty"
      pageTitle="My Students"
      pageSubtitle="View students enrolled in your courses."
    >
      <FacultyStudentsTable />
    </DashboardWrapper>
  );
}
