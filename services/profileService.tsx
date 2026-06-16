import api from "@/api";
import type { ProfileConnection, UserProfile } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

export interface UpdateProfileRequest {
  name: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

const normalizeUserProfile = (profile: UserProfile): UserProfile => ({
  ...profile,
  username: profile.username ?? profile.userName ?? "",
});

const normalizeConnection = (connection: ProfileConnection): ProfileConnection => ({
  ...connection,
  username: connection.username ?? "",
});

export const getProfile = async () => {
  const response = await api().get<UserProfile>("/profile/me", {
    headers: await getAuthHeaders(),
  });

  return normalizeUserProfile(response.data);
};

export const getUserProfile = async (username: string) => {
  const cleanUsername = username.replace(/^@/, "").trim();
  const response = await api().get<UserProfile>(
    `/profile/users/${encodeURIComponent(cleanUsername)}`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return normalizeUserProfile(response.data);
};

export const followUser = async (username: string) => {
  const cleanUsername = username.replace(/^@/, "").trim();
  const response = await api().post<UserProfile>(
    `/profile/users/${encodeURIComponent(cleanUsername)}/follow`,
    null,
    {
      headers: await getAuthHeaders(),
    },
  );

  return normalizeUserProfile(response.data);
};

export const unfollowUser = async (username: string) => {
  const cleanUsername = username.replace(/^@/, "").trim();
  const response = await api().delete<UserProfile>(
    `/profile/users/${encodeURIComponent(cleanUsername)}/follow`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return normalizeUserProfile(response.data);
};

export const getFollowers = async (username: string) => {
  const cleanUsername = username.replace(/^@/, "").trim();
  const response = await api().get<ProfileConnection[]>(
    `/profile/users/${encodeURIComponent(cleanUsername)}/followers`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data.map(normalizeConnection);
};

export const getFollowing = async (username: string) => {
  const cleanUsername = username.replace(/^@/, "").trim();
  const response = await api().get<ProfileConnection[]>(
    `/profile/users/${encodeURIComponent(cleanUsername)}/following`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data.map(normalizeConnection);
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
