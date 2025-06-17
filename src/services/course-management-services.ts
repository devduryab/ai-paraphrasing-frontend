// services/course-service.ts

import {
  ApiResponse,
  Course,
  CourseResponse,
  CreateCourseData,
  FacultyMember,
  FacultyResponse,
  SingleCourseResponse,
  UpdateCourseData,
} from "@/interfaces/course/course-interface";

class CourseService {
  private static instance: CourseService;
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
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

  // Admin methods
  async createCourse(courseData: CreateCourseData): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/api/courses`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to create course");
    }

    return data.data!.course;
  }

  async getAllCourses(filters?: {
    status?: string;
    search?: string;
    facultyId?: string;
  }): Promise<Course[]> {
    const queryParams = new URLSearchParams();

    if (filters?.status) queryParams.set("status", filters.status);
    if (filters?.search) queryParams.set("search", filters.search);
    if (filters?.facultyId) queryParams.set("facultyId", filters.facultyId);

    const response = await fetch(`${this.baseUrl}/api/courses?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<CourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch courses");
    }

    return data.data!.courses;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch course");
    }

    return data.data!.course;
  }

  async updateCourse(
    courseId: string,
    courseData: UpdateCourseData
  ): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to update course");
    }

    return data.data!.course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/courses/${courseId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const data = (await response.json()) as ApiResponse<null>;
      throw new Error(data.message || "Failed to delete course");
    }
  }

  async getAvailableFaculty(): Promise<FacultyMember[]> {
    const response = await fetch(`${this.baseUrl}/api/courses/faculty`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<FacultyResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch faculty");
    }

    return data.data!.faculty;
  }

  // Faculty methods
  async getFacultyCourses(): Promise<Course[]> {
    const response = await fetch(`${this.baseUrl}/api/courses/my-courses`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<CourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch faculty courses");
    }

    return data.data!.courses;
  }

  // Student methods
  async getStudentCourses(): Promise<Course[]> {
    const response = await fetch(`${this.baseUrl}/api/courses/my-enrollments`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<CourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch student courses");
    }

    return data.data!.courses;
  }

  async enrollInCourse(courseId: string): Promise<Course> {
    const response = await fetch(
      `${this.baseUrl}/api/courses/${courseId}/enroll`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to enroll in course");
    }

    return data.data!.course;
  }

  async unenrollFromCourse(courseId: string): Promise<Course> {
    const response = await fetch(
      `${this.baseUrl}/api/courses/${courseId}/unenroll`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to unenroll from course");
    }

    return data.data!.course;
  }

  async removeStudentFromCourse(
    courseId: string,
    studentId: string
  ): Promise<Course> {
    const response = await fetch(
      `${this.baseUrl}/api/courses/${courseId}/students/${studentId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<SingleCourseResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to remove student from course");
    }

    return data.data!.course;
  }
}

export default CourseService;
