import { apiRequest } from "./queryClient";

export interface AuthStatus {
  authenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await apiRequest("POST", "/api/auth/logout");
    if (!response.ok) {
      throw new Error("Logout failed");
    }
  },

  async getStatus(): Promise<AuthStatus> {
    const response = await apiRequest("GET", "/api/auth/status");
    return response.json();
  }
};
