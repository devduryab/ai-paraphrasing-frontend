"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  UserCheck,
  UserX,
} from "lucide-react";
import CreateUserModal from "./CreateUserModal";
import { UserListItem } from "@/interfaces/user-managment-interface";
import UserManagementService from "@/services/user-managment-services";

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const userService = UserManagementService.getInstance();

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filters.role && { role: filters.role as "faculty" | "student" }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      };

      const response = await userService.getUsers(params);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.totalUsers);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || "Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for API calls
    const apiValue = value === "all" ? "" : value;
    setFilters((prev) => ({ ...prev, [key]: apiValue }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle user status update
  const handleStatusUpdate = async (
    userId: string,
    status: "active" | "inactive" | "suspended"
  ) => {
    try {
      await userService.updateUserStatus(userId, status);
      loadUsers(); // Refresh the list
    } catch (error: any) {
      setError(error.message || "Failed to update user status");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      loadUsers(); // Refresh the list
    } catch (error: any) {
      setError(error.message || "Failed to delete user");
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "Active",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      inactive: {
        label: "Inactive",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800",
      },
      suspended: {
        label: "Suspended",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
      pending: {
        label: "Pending",
        variant: "outline" as const,
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      faculty: { label: "Faculty", className: "bg-blue-100 text-blue-800" },
      student: { label: "Student", className: "bg-purple-100 text-purple-800" },
      super_admin: {
        label: "Admin",
        className: "bg-orange-100 text-orange-800",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.student;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold">
                User Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage faculty and students ({totalUsers} total users)
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select
              value={filters.role || undefined}
              onValueChange={(value) => handleFilterChange("role", value || "")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || undefined}
              onValueChange={(value) =>
                handleFilterChange("status", value || "")
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
                className="mt-4"
              >
                Create First User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Created
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.profile.firstName.charAt(0)}
                            {user.profile.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.profile.firstName} {user.profile.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            {user.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(user._id, "inactive")
                                }
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(user._id, "active")
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {users.length} of {totalUsers} users
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={loadUsers}
      />
    </div>
  );
};

export default UsersTable;
