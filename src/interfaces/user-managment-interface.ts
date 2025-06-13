export interface CreateUserData {
  email: string;
  password: string;
  role: 'faculty' | 'student';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  assignedCourses?: string[]; // For faculty only
}

export interface UserListItem {
  _id: string;
  email: string;
  role: 'faculty' | 'student' | 'super_admin';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  createdAt: string;
  assignedCourses?: string[];
}

export interface UsersResponse {
  users: UserListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface CreateUserResponse {
  user: UserListItem;
}

export interface GetUsersResponse {
  users: UserListItem[];
  collections: {
    students: number;
    faculty: number;
    superAdmins: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}

export interface UpdateUserResponse {
  user: UserListItem;
}