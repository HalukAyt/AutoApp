import api from "@/api";

import { clearToken, saveToken } from "./authTokenService";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export const login = async (payload: LoginRequest) => {
  const response = await api().post<AuthResponse>("/auth/login", payload);
  await saveToken(response.data.token);
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  const response = await api().post<AuthResponse>("/auth/register", payload);
  await saveToken(response.data.token);
  return response.data;
};

export const logout = () => clearToken();