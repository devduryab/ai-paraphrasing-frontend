// app/student/courses/page.tsx
"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import StudentCoursesTable from "@/components/students/courses/StudentCoursesTable";

export default function StudentCoursesPage() {
  return (
    <DashboardWrapper
      requiredRole="student"
      pageTitle="Course Registration"
      pageSubtitle="Browse available courses and manage your enrollments."
    >
      <StudentCoursesTable />
    </DashboardWrapper>
  );
}
