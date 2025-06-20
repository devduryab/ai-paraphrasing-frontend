"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  Upload,
  Search,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Assignment } from "@/interfaces/assignment/assignment-interface";
import AssignmentDetailsModal from "./StudentAssignmentDetailsModal";
import SubmissionModal from "./StudentSubmissionModal";
import StudentAssignmentService from "@/services/student-assignment-services";

interface AssignmentCardProps {
  assignment: Assignment;
  onViewDetails: (assignment: Assignment) => void;
  onSubmit: (assignment: Assignment) => void;
  onViewSubmission: (assignment: Assignment) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onViewDetails,
  onSubmit,
  onViewSubmission,
}) => {
  const service = StudentAssignmentService.getInstance();
  const isOverdue = service.isAssignmentOverdue(assignment.dueDate);
  const timeLeft = service.getTimeUntilDue(assignment.dueDate);
  const hasSubmission = assignment.mySubmission;

  const getStatusBadge = () => {
    if (hasSubmission) {
      const statusColor = service.getSubmissionStatusColor(
        hasSubmission.status
      );
      return (
        <Badge className={statusColor}>
          {hasSubmission.status === "graded"
            ? `Graded: ${service.formatGrade(
                hasSubmission.grade,
                assignment.maxScore
              )}`
            : hasSubmission.status.replace("_", " ")}
        </Badge>
      );
    }

    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{assignment.title}</h3>
            <p className="text-gray-600 text-sm mb-2">
              {typeof assignment.courseId === "string"
                ? assignment.courseId
                : assignment.courseId.name}
            </p>
            <p className="text-gray-500 text-sm line-clamp-2">
              {assignment.description}
            </p>
          </div>
          <div className="text-right">{getStatusBadge()}</div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>Max: {assignment.maxScore} pts</span>
            </div>
          </div>
          <div
            className={`flex items-center space-x-1 ${
              isOverdue ? "text-red-600" : "text-blue-600"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(assignment)}
            className="flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Button>

          {hasSubmission ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewSubmission(assignment)}
              className="flex items-center space-x-1"
            >
              <FileText className="w-4 h-4" />
              <span>View Submission</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onSubmit(assignment)}
              disabled={isOverdue && !assignment.allowLateSubmission}
              className="flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>{isOverdue ? "Submit Late" : "Submit"}</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StudentAssignmentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    courseId: "all",
  });

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const assignmentService = StudentAssignmentService.getInstance();

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      loadAssignments();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [filters]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const filterParams: any = {};
      if (filters.status !== "all") filterParams.status = filters.status;
      if (filters.courseId !== "all") filterParams.courseId = filters.courseId;
      if (filters.search.trim()) filterParams.search = filters.search.trim();

      const fetchedAssignments = await assignmentService.getStudentAssignments(
        filterParams
      );
      setAssignments(fetchedAssignments);
    } catch (error: any) {
      console.error("Error loading assignments:", error);
      setError(error.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDetailsModalOpen(true);
  };

  const handleSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionModalOpen(true);
  };

  const handleViewSubmission = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setDetailsModalOpen(true);
  };

  const handleSubmissionSuccess = () => {
    setSubmissionModalOpen(false);
    loadAssignments(); // Refresh
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Assignments
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>My Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500">
                {filters.search ||
                filters.status !== "all" ||
                filters.courseId !== "all"
                  ? "Try adjusting your filters to see more assignments."
                  : "You don't have any assignments yet. Check back later or contact your instructor."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment._id}
                  assignment={assignment}
                  onViewDetails={handleViewDetails}
                  onSubmit={handleSubmit}
                  onViewSubmission={handleViewSubmission}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedAssignment && (
        <>
          <AssignmentDetailsModal
            isOpen={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            assignment={selectedAssignment}
          />
          <SubmissionModal
            isOpen={submissionModalOpen}
            onClose={() => setSubmissionModalOpen(false)}
            assignment={selectedAssignment}
            onSuccess={handleSubmissionSuccess}
          />
        </>
      )}
    </div>
  );
};

export default StudentAssignmentDashboard;
