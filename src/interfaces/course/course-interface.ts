export interface Course {
  _id: string;
  courseId: string;
  name: string;
  maxSlots: number;
  assignedFaculty: FacultyMember[];
  enrolledStudents: Student[];
  status: "active" | "inactive" | "full";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  enrolledCount: number;
  availableSlots: number;
}

export interface FacultyMember {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface Student {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: number
  };
}

export interface CreateCourseData {
  name: string;
  maxSlots: number;
  assignedFaculty: string[];
  status: "active" | "inactive";
}

export interface UpdateCourseData {
  name?: string;
  maxSlots?: number;
  assignedFaculty?: string[];
  status?: "active" | "inactive" | "full";
}

export interface CourseResponse {
  courses: Course[];
}

export interface SingleCourseResponse {
  course: Course;
}

export interface FacultyResponse {
  faculty: FacultyMember[];
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}
