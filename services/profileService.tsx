import api from "@/api";
import type { UserProfile } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

export const getProfile = async () => {
  const response = await api().get<UserProfile>("/profile/me", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const updateProfile = async (payload: UpdateProfileRequest) => {
  const response = await api().post<UserProfile>(
    "/profile/updateProfile",
    payload,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};