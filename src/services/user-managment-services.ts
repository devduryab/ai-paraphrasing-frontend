import {
  ApiResponse,
  CreateUserData,
  CreateUserResponse,
  GetUsersResponse,
  UpdateUserResponse,
  UserListItem,
  UsersResponse,
  UpdateUserData,
} from "@/interfaces/user-managment-interface";

class UserManagementService {
  private static instance: UserManagementService;
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  public static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("token");
    
    if (!token || token === 'undefined') {
      throw new Error("No authentication token found. Please login again.");
    }
    
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Create new user (faculty or student)
  async createUser(userData: CreateUserData): Promise<{ user: UserListItem }> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = (await response.json()) as ApiResponse<CreateUserResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to create user");
    }

    return data.data!;
  }

  // Get all users with pagination and filters
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: "faculty" | "student";
    status?: string;
    search?: string;
  } = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.role) queryParams.set("role", params.role);
    if (params.status) queryParams.set("status", params.status);
    if (params.search) queryParams.set("search", params.search);

    const response = await fetch(
      `${this.baseUrl}/api/auth/users?${queryParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = (await response.json()) as ApiResponse<GetUsersResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return {
      users: data.data!.users,
      pagination: data.data!.pagination,
    };
  }

  // Get single user by ID
  async getUserById(userId: string): Promise<UserListItem> {
    const response = await fetch(`${this.baseUrl}/api/auth/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });

    const data = (await response.json()) as ApiResponse<{ user: UserListItem }>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user");
    }

    return data.data!.user;
  }

  // Update user details
  async updateUser(userId: string, userData: UpdateUserData): Promise<{ user: UserListItem }> {
    const response = await fetch(`${this.baseUrl}/api/auth/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = (await response.json()) as ApiResponse<UpdateUserResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user");
    }

    return data.data!;
  }

  // Update user status
  async updateUserStatus(
    userId: string,
    status: "active" | "inactive" | "suspended"
  ): Promise<{ user: UserListItem }> {
    const response = await fetch(
      `${this.baseUrl}/api/auth/users/${userId}/status`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    const data = (await response.json()) as ApiResponse<UpdateUserResponse>;

    if (!response.ok) {
      throw new Error(data.message || "Failed to update user status");
    }

    return data.data!;
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/auth/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const data = (await response.json()) as ApiResponse<null>;
      throw new Error(data.message || "Failed to delete user");
    }
  }
}

export default UserManagementService;