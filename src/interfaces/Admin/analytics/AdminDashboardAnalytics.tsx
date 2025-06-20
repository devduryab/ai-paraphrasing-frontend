import { Assignment, StudentSubmission } from "@/interfaces/assignment/assignment-interface";
import { Course } from "@/interfaces/course/course-interface";
import { UserListItem } from "@/interfaces/user-managment-interface";

export interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  fullCourses: number;
  totalEnrollments: number;
  averageEnrollmentRate: number;
  recentUsers: UserListItem[];
  topCourses: CourseEnrollmentData[];
  userGrowthData: GrowthData[];
  enrollmentTrends: EnrollmentTrendData[];
  courseCapacityData: CourseCapacityData[];
}

export interface FacultyAnalytics {
  totalAssignedCourses: number;
  totalStudentsAcrossCourses: number;
  averageEnrollmentRate: number;
  myCourses: Course[];
  enrollmentTrends: EnrollmentTrendData[];
  coursePerformance: CoursePerformanceData[];
  recentEnrollments: RecentEnrollmentData[];
}

export interface StudentAnalytics {
  enrolledCoursesCount: number;
  remainingSlots: number;
  myCourses: Course[];
  enrollmentHistory: EnrollmentHistoryData[];
  availableCoursesCount: number;
  popularCourses: CourseEnrollmentData[];
  facultyOverview: FacultyOverviewData[];
}

export interface CourseEnrollmentData {
  courseId: string;
  courseName: string;
  enrolledCount: number;
  maxSlots: number;
  enrollmentRate: number;
}

export interface GrowthData {
  month: string;
  students: number;
  faculty: number;
  courses: number;
}

export interface EnrollmentTrendData {
  month: string;
  enrollments: number;
  courseName?: string;
}

export interface CourseCapacityData {
  courseId: string;
  courseName: string;
  utilized: number;
  available: number;
  utilizationRate: number;
}

export interface CoursePerformanceData {
  courseId: string;
  courseName: string;
  enrolledCount: number;
  maxSlots: number;
  status: string;
}

export interface RecentEnrollmentData {
  studentName: string;
  courseName: string;
  enrollmentDate: string;
}

export interface EnrollmentHistoryData {
  courseName: string;
  enrollmentDate: string;
  status: string;
}

export interface FacultyOverviewData {
  facultyName: string;
  coursesCount: number;
  email: string;
}



// In your assignment-interface.ts file, add:
export interface StudentAssignmentAnalytics {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  gradedAssignments: number;
  averageGrade: number;
  upcomingDeadlines: Assignment[];
  recentSubmissions: StudentSubmission[];
}
