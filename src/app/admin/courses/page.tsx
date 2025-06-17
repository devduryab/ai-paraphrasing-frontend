// app/admin/courses/page.tsx
"use client";

import CoursesTable from "@/components/admin/courses/CourseTable";
import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";

export default function AdminCoursesPage() {
  return (
    <DashboardWrapper
      requiredRole="super_admin"
      pageTitle="Course Management"
      pageSubtitle="Create and manage courses in the system."
    >
      <CoursesTable />
    </DashboardWrapper>
  );
}