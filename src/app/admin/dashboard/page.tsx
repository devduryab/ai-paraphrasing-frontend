"use client";

import LogoutButton from "@/components/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import { Users, BookOpen, Settings, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.profile.firstName || "Admin"}! Here’s a quick overview of your system.
          </p>
          <LogoutButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Add User</h3>
              <p className="text-sm text-gray-600">Register new students or faculty</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Check system analytics</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600">Configure system parameters</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}