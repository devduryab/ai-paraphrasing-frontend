import {
  AdminAnalytics,
  EnrollmentTrendData,
  FacultyAnalytics,
  FacultyOverviewData,
  GrowthData,
  RecentEnrollmentData,
  StudentAnalytics,
} from "@/interfaces/Admin/analytics/AdminDashboardAnalytics";
import CourseService from "./course-management-services";
import UserManagementService from "./user-managment-services";
import { Course } from "@/interfaces/course/course-interface";

class AnalyticsService {
  private static instance: AnalyticsService;
  private courseService: CourseService;
  private userService: UserManagementService;
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  private constructor() {
    this.courseService = CourseService.getInstance();
    this.userService = UserManagementService.getInstance();
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

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Admin Analytics
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/admin`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin analytics");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      throw error;
    }
  }

  // Faculty Analytics
  async getFacultyAnalytics(): Promise<FacultyAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/faculty`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch faculty analytics");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching faculty analytics:", error);
      throw error;
    }
  }

  // Student Analytics
  async getStudentAnalytics(): Promise<StudentAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/student`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch student analytics");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching student analytics:", error);
      throw error;
    }
  }
  // Helper methods for generating mock data (replace with real data later)
  private generateGrowthData(): GrowthData[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      students: 20 + index * 15 + Math.floor(Math.random() * 10),
      faculty: 5 + index * 2 + Math.floor(Math.random() * 3),
      courses: 3 + index * 2 + Math.floor(Math.random() * 2),
    }));
  }

  private generateEnrollmentTrends(): EnrollmentTrendData[] {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      enrollments: 50 + index * 20 + Math.floor(Math.random() * 30),
    }));
  }

  private generateRecentEnrollments(courses: Course[]): RecentEnrollmentData[] {
    return courses.slice(0, 5).map((course, index) => ({
      studentName: `Student ${index + 1}`,
      courseName: course.name,
      enrollmentDate: new Date(
        Date.now() - index * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  }

  private generateFacultyOverview(courses: Course[]): FacultyOverviewData[] {
    const facultyMap = new Map();

    courses.forEach((course) => {
      course.assignedFaculty?.forEach((faculty) => {
        const key = faculty._id;
        if (!facultyMap.has(key)) {
          facultyMap.set(key, {
            facultyName: `${faculty.profile?.firstName || ""} ${
              faculty.profile?.lastName || ""
            }`.trim(),
            coursesCount: 0,
            email: faculty.email || "",
          });
        }
        facultyMap.get(key).coursesCount++;
      });
    });

    return Array.from(facultyMap.values());
  }
}

export default AnalyticsService;
