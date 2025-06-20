// "use client";

// import FacultyAnalysisDashboard from "@/components/faculty/analysis/FacultyAnalysisDashboard";
// import React from "react";

// export default function FacultyAnalysisPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <FacultyAnalysisDashboard />
//       </div>
//     </div>
//   );
// }

"use client";

import DashboardWrapper from "@/components/dashboard/layout/DashboardWrapper";
import FacultyAnalysisDashboard from "@/components/faculty/analysis/FacultyAnalysisDashboard";

export default function FacultyAssignmentsPage() {
  return (
    <DashboardWrapper
      requiredRole="faculty"
      pageTitle="Assignment Management"
      pageSubtitle="Create and manage assignments for your courses."
    >
      <FacultyAnalysisDashboard />
    </DashboardWrapper>
  );
}
