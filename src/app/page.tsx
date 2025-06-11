"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { GraduationCap } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect authenticated users to their dashboard
        const roleBasedRoutes = {
          student: "/student/dashboard",
          faculty: "/faculty/dashboard",
          super_admin: "/admin/dashboard",
        };
        router.push(roleBasedRoutes[user.role]);
      } else {
        // Redirect unauthenticated users to login
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          AI Paraphrasing Checking System
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
