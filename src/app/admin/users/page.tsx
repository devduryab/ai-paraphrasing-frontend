"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import UsersTable from "@/components/admin/users/UsersTable";

export default function AdminUsersPage() {
  return (
    <DashboardWrapper
      requiredRole="super_admin"
      pageTitle="User Management"
      pageSubtitle="Create and manage faculty and students in the system."
     
    >
      <UsersTable />
    </DashboardWrapper>
  );
}
