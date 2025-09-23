import { apiRequest } from "./queryClient";

export interface AuthStatus {
  authenticated: boolean;
}

export interface LoginRequest {
  password: string;
}

export const authService = {
  async login(password: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest("POST", "/api/auth/login", { password });
    return response.json();
  },

  async logout(): Promise<{ message: string }> {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  },

  async getStatus(): Promise<AuthStatus> {
    const response = await apiRequest("GET", "/api/auth/status");
    return response.json();
  }
};
