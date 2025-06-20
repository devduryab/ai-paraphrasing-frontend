// services/student-assignment-service.ts
import {
  Assignment,
  StudentSubmission,
  StudentAnalytics,
} from "@/interfaces/assignment/assignment-interface";

class StudentAssignmentService {
  private static instance: StudentAssignmentService;
  private baseURL: string;

  private constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }

  public static getInstance(): StudentAssignmentService {
    if (!StudentAssignmentService.instance) {
      StudentAssignmentService.instance = new StudentAssignmentService();
    }
    return StudentAssignmentService.instance;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
      throw new Error("No authentication token found. Please login again.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Get all assignments for student (from enrolled courses)
  public async getStudentAssignments(filters?: {
    courseId?: string;
    status?: string;
    search?: string;
  }): Promise<Assignment[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.courseId) queryParams.append("courseId", filters.courseId);
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.search) queryParams.append("search", filters.search);

      const response = await fetch(
        `${this.baseURL}/api/assignments?${queryParams.toString()}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assignments");
      }

      return data.data?.assignments || [];
    } catch (error: any) {
      console.error("Error fetching student assignments:", error);
      throw new Error(error.message || "Failed to fetch assignments");
    }
  }

  // Get single assignment details
  public async getAssignmentById(assignmentId: string): Promise<Assignment> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/assignments/${assignmentId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch assignment");
      }

      return data.data?.assignment;
    } catch (error: any) {
      console.error("Error fetching assignment:", error);
      throw new Error(error.message || "Failed to fetch assignment");
    }
  }

  // Submit assignment
  public async createSubmission(
    formData: FormData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/assignments/submissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // Don't set Content-Type for FormData - let browser set it
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit assignment");
      }

      return { success: true, data: data.data?.submission };
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      return { success: false, error: error.message };
    }
  }

  public async updateSubmission(
    submissionId: string,
    formData: FormData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/assignments/submissions/${submissionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update submission");
      }

      return { success: true, data: data.data?.submission };
    } catch (error: any) {
      console.error("Error updating submission:", error);
      return { success: false, error: error.message };
    }
  }

  // Get student's own submissions
  public async getMySubmissions(): Promise<StudentSubmission[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/assignments/my-submissions`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch submissions");
      }

      return data.data?.submissions || [];
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      throw new Error(error.message || "Failed to fetch submissions");
    }
  }

  // Get submission by ID
  public async getSubmissionById(
    submissionId: string
  ): Promise<StudentSubmission> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/assignments/submissions/${submissionId}`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch submission");
      }

      return data.data?.submission;
    } catch (error: any) {
      console.error("Error fetching submission:", error);
      throw new Error(error.message || "Failed to fetch submission");
    }
  }
  public async getStudentAnalytics(): Promise<StudentAnalytics> {
    try {
      const response = await fetch(`${this.baseURL}/api/analytics/student`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      return data.data;
    } catch (error: any) {
      console.error("Error fetching student analytics:", error);
      throw error;
    }
  }

  // Helper methods
  public isAssignmentOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  public getTimeUntilDue(dueDate: string): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();

    if (diffTime < 0) {
      return "Overdue";
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "1 day left";
    } else if (diffDays < 7) {
      return `${diffDays} days left`;
    } else {
      return `${Math.ceil(diffDays / 7)} weeks left`;
    }
  }

  public getSubmissionStatusColor(status: string): string {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "graded":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-red-100 text-red-800";
      case "not_submitted":
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  public formatGrade(grade?: number, maxScore?: number): string {
    if (grade === undefined || maxScore === undefined) {
      return "Not graded";
    }
    const percentage = ((grade / maxScore) * 100).toFixed(1);
    return `${grade}/${maxScore} (${percentage}%)`;
  }
}

export default StudentAssignmentService;
