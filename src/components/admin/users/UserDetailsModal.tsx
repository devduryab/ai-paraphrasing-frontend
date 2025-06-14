"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Mail, Phone, Calendar, User } from "lucide-react";
import { UserListItem } from "@/interfaces/user-managment-interface";
import { UserDetailsModalProps } from "@/interfaces/Admin/AdminInterfaces";
import UserManagementService from "@/services/user-managment-services";

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [user, setUser] = useState<UserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const userService = UserManagementService.getInstance();

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserById(userId);
      setUser(userData);
    } catch (error: any) {
      setError(error.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      suspended: { label: "Suspended", className: "bg-red-100 text-red-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              User Details
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading user details...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                  {user.profile.firstName.charAt(0)}
                  {user.profile.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.profile.firstName} {user.profile.lastName}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact Information
                </h4>

                <div className="grid gap-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Email
                      </div>
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </div>
                  </div>

                  {user.profile.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Phone
                        </div>
                        <div className="text-sm text-gray-900">
                          {user.profile.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Member Since
                      </div>
                      <div className="text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Account Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      User ID
                    </div>
                    <div className="text-sm text-gray-900 font-mono">
                      {user._id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Role
                    </div>
                    <div className="text-sm text-gray-900 capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Courses (if faculty) */}
              {user.role === "faculty" &&
                user.assignedCourses &&
                user.assignedCourses.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Assigned Courses
                    </h4>
                    <div className="space-y-2">
                      {user.assignedCourses.map((courseId, index) => (
                        <div
                          key={index}
                          className="p-2 bg-blue-50 rounded border"
                        >
                          <div className="text-sm text-blue-800">
                            Course ID: {courseId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailsModal;
