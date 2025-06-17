// components/faculty/assignments/AssignmentTable.tsx
"use client";

import React, { useState } from "react";
import { Edit, Trash2, Eye, Users, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AssignmentService from "@/services/assignment-service";
import {
  AssignmentStatus,
  AssignmentWithDetails,
} from "@/interfaces/assignment/assignment-interface";
import EditAssignmentModal from "./EditAssignmentModal";
import AssignmentDetailsModal from "./AssignmentDetailsModal";

interface AssignmentTableProps {
  assignments: AssignmentWithDetails[];
  loading: boolean;
  onAssignmentDeleted: () => void;
  onAssignmentUpdated: () => void;
}

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  loading,
  onAssignmentDeleted,
  onAssignmentUpdated,
}) => {
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const assignmentService = AssignmentService.getInstance();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    const statusConfig = {
      [AssignmentStatus.ACTIVE]: {
        label: "Active",
        variant: "default" as const,
      },
      [AssignmentStatus.DRAFT]: {
        label: "Draft",
        variant: "secondary" as const,
      },
      [AssignmentStatus.ARCHIVED]: {
        label: "Archived",
        variant: "outline" as const,
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDueDateStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return { status: "overdue", color: "text-red-600", label: "Overdue" };
    } else if (diffDays <= 3) {
      return {
        status: "due-soon",
        color: "text-orange-600",
        label: `${diffDays} days left`,
      };
    } else {
      return {
        status: "upcoming",
        color: "text-green-600",
        label: `${diffDays} days left`,
      };
    }
  };

  const handleEdit = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setShowEditModal(true);
  };

  const handleViewDetails = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    setShowDetailsModal(true);
  };

  const handleDelete = async (assignmentId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this assignment? This action cannot be undone."
      )
    ) {
      try {
        setDeletingId(assignmentId);
        await assignmentService.deleteAssignment(assignmentId);
        onAssignmentDeleted();
      } catch (error: any) {
        console.error("Error deleting assignment:", error);
        alert(error.message || "Failed to delete assignment");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getSubmissionProgress = (
    submissionCount: number,
    gradedCount: number
  ) => {
    if (submissionCount === 0) return { percentage: 0, color: "bg-gray-200" };
    const percentage = (gradedCount / submissionCount) * 100;
    const color =
      percentage === 100
        ? "bg-green-500"
        : percentage > 50
        ? "bg-blue-500"
        : "bg-orange-500";
    return { percentage, color };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">
                        No assignments found
                      </p>
                      <p className="text-sm">
                        Create your first assignment to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => {
                  const dueDateStatus = getDueDateStatus(assignment.dueDate);
                  const submissionProgress = getSubmissionProgress(
                    assignment.submissionCount,
                    assignment.gradedCount
                  );

                  return (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        <div>
                          <h4
                            className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => handleViewDetails(assignment)}
                          >
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Max Score: {assignment.maxScore}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 capitalize">
                              {assignment.assignmentType.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {assignment.course.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.course.courseId}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(assignment.dueDate)}
                          </p>
                          <p className={`text-xs ${dueDateStatus.color}`}>
                            {dueDateStatus.label}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {assignment.submissionCount} submitted
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${submissionProgress.color}`}
                                style={{
                                  width: `${submissionProgress.percentage}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {assignment.gradedCount}/
                              {assignment.submissionCount} graded
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(assignment)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(assignment)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Assignment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(assignment._id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deletingId === assignment._id}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingId === assignment._id
                                ? "Deleting..."
                                : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Assignment Modal */}
      {selectedAssignment && (
        <EditAssignmentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAssignment(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAssignment(null);
            onAssignmentUpdated();
          }}
          assignment={selectedAssignment}
        />
      )}

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <AssignmentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
        />
      )}
    </>
  );
};

export default AssignmentTable;
