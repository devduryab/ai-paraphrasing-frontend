// components/auth/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { verifyToken } from "@/store/slices/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user, token, isLoading, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    // If we have a token but no user, verify the token
    if (token && !user && !isLoading) {
      dispatch(verifyToken(token));
    }
  }, [token, user, isLoading, dispatch]);

  useEffect(() => {
    if (!isLoading) {
      // Handle unauthenticated users
      if (!isAuthenticated && pathname !== "/login") {
        router.push("/login");
        return;
      }

      // Handle authenticated users
      if (isAuthenticated && user) {
        // Redirect authenticated users away from login page
        if (pathname === "/login") {
          const dashboardRoute =
            user.role === "super_admin"
              ? "/admin/dashboard"
              : user.role === "faculty"
              ? "/faculty/dashboard"
              : "/student/dashboard";
          router.push(dashboardRoute);
          return;
        }

        // Handle root path redirect
        if (pathname === "/") {
          const dashboardRoute =
            user.role === "super_admin"
              ? "/admin/dashboard"
              : user.role === "faculty"
              ? "/faculty/dashboard"
              : "/student/dashboard";
          router.push(dashboardRoute);
          return;
        }
      }
    }
  }, [isAuthenticated, user, pathname, router, isLoading]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
