"use client";

import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { DashboardLayoutProps } from "@/interfaces/dashboard/dashboardInterface";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userRole,
  pageTitle,
  pageSubtitle,
  user,
  showFilters = true,
  showExport = true,
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={pageTitle}
          subtitle={pageSubtitle}
          showFilters={showFilters}
          showExport={showExport}
          user={user}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
