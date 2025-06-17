// services/assignment-service.ts

import {
  ApiResponse,
  AssignmentWithDetails,
  CreateAssignmentData,
  UpdateAssignmentData,
  CreateSubmissionData,
  GradeSubmissionData,
  AssignmentResponse,
  SingleAssignmentResponse,
  SubmissionResponse,
  SingleSubmissionResponse,
  SubmissionWithDetails,
  AssignmentStats,
  AssignmentStatus,
} from "../interfaces/assignment/assignment-interface";

class AssignmentService {
  private static instance: AssignmentService;
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  public static getInstance(): AssignmentService {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      throw new Error("No authentication token found. Please login again.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Faculty Assignment Management

  // Create new assignment
  async createAssignment(
    assignmentData: CreateAssignmentData
  ): Promise<AssignmentWithDetails> {
    const response = await fetch(`${this.baseUrl}/api/assignments`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });

    const data =
      (await response.json()) as ApiResponse<SingleAssignmentResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to create assignment");
    }

    return data.data!.assignment;
  }

  // Get all assignments (role-based filtering on backend)
  async getAllAssignments(filters?: {
    facultyId?: string;
    courseId?: string;
    status?: AssignmentStatus;
    search?: string;
  }): Promise<AssignmentWithDetails[]> {
    const queryParams = new URLSearchParams();

    if (filters?.facultyId) queryParams.set("facultyId", filters.facultyId);
    if (filters?.courseId) queryParams.set("courseId", filters.courseId);
    if (filters?.status) queryParams.set("status", filters.status);
    if (filters?.search) queryParams.set("search", filters.search);

    const response = await fetch(
      `${this.baseUrl}/api/assignments?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<AssignmentResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch assignments");
    }

    return data.data!.assignments;
  }

  // Get assignment by ID
  async getAssignmentById(
    assignmentId: string
  ): Promise<AssignmentWithDetails> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/${assignmentId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data =
      (await response.json()) as ApiResponse<SingleAssignmentResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch assignment");
    }

    return data.data!.assignment;
  }

  // Update assignment
  async updateAssignment(
    assignmentId: string,
    updateData: UpdateAssignmentData
  ): Promise<AssignmentWithDetails> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/${assignmentId}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      }
    );

    const data =
      (await response.json()) as ApiResponse<SingleAssignmentResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to update assignment");
    }

    return data.data!.assignment;
  }

  // Delete assignment
  async deleteAssignment(assignmentId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/${assignmentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const data = (await response.json()) as ApiResponse<null>;
      throw new Error(data.message || "Failed to delete assignment");
    }
  }

  // Faculty Submission Management

  // Get submissions for an assignment
  async getAssignmentSubmissions(
    assignmentId: string
  ): Promise<SubmissionWithDetails[]> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/${assignmentId}/submissions`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<SubmissionResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch submissions");
    }

    return data.data!.submissions;
  }

  // Grade a submission
  async gradeSubmission(
    submissionId: string,
    gradeData: GradeSubmissionData
  ): Promise<SubmissionWithDetails> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/submissions/${submissionId}/grade`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(gradeData),
      }
    );

    const data =
      (await response.json()) as ApiResponse<SingleSubmissionResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to grade submission");
    }

    return data.data!.submission;
  }

  // Student methods

  // Create submission
  async createSubmission(
    submissionData: CreateSubmissionData
  ): Promise<SubmissionWithDetails> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/submissions`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(submissionData),
      }
    );

    const data =
      (await response.json()) as ApiResponse<SingleSubmissionResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to create submission");
    }

    return data.data!.submission;
  }

  // Get student's submissions
  async getStudentSubmissions(): Promise<SubmissionWithDetails[]> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/my-submissions`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<SubmissionResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student submissions");
    }

    return data.data!.submissions;
  }

  // Common methods

  // Get submission by ID
  async getSubmissionById(
    submissionId: string
  ): Promise<SubmissionWithDetails> {
    const response = await fetch(
      `${this.baseUrl}/api/assignments/submissions/${submissionId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data =
      (await response.json()) as ApiResponse<SingleSubmissionResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch submission");
    }

    return data.data!.submission;
  }

  // Get assignment statistics
  async getAssignmentStats(
    facultyId?: string,
    courseId?: string
  ): Promise<AssignmentStats> {
    const queryParams = new URLSearchParams();

    if (facultyId) queryParams.set("facultyId", facultyId);
    if (courseId) queryParams.set("courseId", courseId);

    const response = await fetch(
      `${this.baseUrl}/api/assignments/stats/overview?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<{
      stats: AssignmentStats;
    }>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch assignment statistics");
    }

    return data.data!.stats;
  }
}

export default AssignmentService;
