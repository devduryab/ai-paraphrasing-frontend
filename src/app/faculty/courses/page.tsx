// app/faculty/courses/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import FacultyCoursesTable from "@/components/faculty/courses/FacultyCoursesTable";

export default function FacultyCoursesPage() {
  return (
    <DashboardWrapper
      requiredRole="faculty"
      pageTitle="My Courses"
      pageSubtitle="View and manage your assigned courses."
    >
      <FacultyCoursesTable />
    </DashboardWrapper>
  );
}