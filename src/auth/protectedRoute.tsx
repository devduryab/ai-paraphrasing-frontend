// components/auth/ProtectedRoute.tsx
"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"student" | "faculty" | "superadmin">;
  requireApproval?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["student", "faculty", "superadmin"],
  requireApproval = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        return;
      }

      // Check role permissions
      if (!allowedRoles.includes(user.role)) {
        const roleBasedRoutes = {
          student: "/student/dashboard",
          faculty: "/faculty/dashboard",
          superadmin: "/admin/dashboard",
        };
        router.push(roleBasedRoutes[user.role]);
        return;
      }

      // Check approval status if required
      if (requireApproval && user.role === "student" && !user.isApproved) {
        router.push("/student/pending-approval");
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, router, allowedRoles, requireApproval]);

  // Show loading spinner while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not authorized
  if (
    !isAuthenticated ||
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>        
    );
  }

  // Check approval status
  if (requireApproval && user.role === "student" && !user.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Approval Pending</h2>
          <p className="text-gray-600">Your account is pending approval from the administrator.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}