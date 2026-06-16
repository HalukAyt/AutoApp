import api from "@/api";
import type { AutoEvent, Club, UserRoute } from "@/types/domain";
import { Platform } from "react-native";

import { getAuthHeaders } from "./authTokenService";
import { createEventAtPath, type CreateEventRequest } from "./eventService";
import type { CreateRouteRequest } from "./routeService";

export interface CreateClubRequest {
  name: string;
  description?: string;
  imageUri?: string | null;
}

const getMobileFileUri = (imageUri: string) =>
  Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");

const appendImage = (formData: FormData, imageUri: string | null | undefined) => {
  if (!imageUri) return;

  const filename = imageUri.split("/").pop() || "club.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: getMobileFileUri(imageUri),
    name: filename,
    type,
  } as any);
};

export const getClubs = async () => {
  const response = await api().get<Club[]>("/clubs", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const getClub = async (clubId: number) => {
  const response = await api().get<Club>(`/clubs/${clubId}`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createClub = async (payload: CreateClubRequest) => {
  if (!payload.imageUri) {
    const response = await api().post<Club>(
      "/clubs",
      {
        name: payload.name,
        description: payload.description,
      },
      {
        headers: await getAuthHeaders(),
      },
    );

    return response.data;
  }

  const formData = new FormData();
  formData.append("name", payload.name.trim());

  if (payload.description?.trim()) {
    formData.append("description", payload.description.trim());
  }

  appendImage(formData, payload.imageUri);

  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}/clubs`, {
    method: "POST",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Club>;
};

export const updateClub = async (clubId: number, payload: CreateClubRequest) => {
  if (!payload.imageUri) {
    const response = await api().put<Club>(
      `/clubs/${clubId}`,
      {
        name: payload.name,
        description: payload.description,
      },
      {
        headers: await getAuthHeaders(),
      },
    );

    return response.data;
  }

  const formData = new FormData();
  formData.append("name", payload.name.trim());

  if (payload.description?.trim()) {
    formData.append("description", payload.description.trim());
  }

  appendImage(formData, payload.imageUri);

  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}/clubs/${clubId}`, {
    method: "PUT",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Club>;
};

export const joinClub = async (clubId: number) => {
  const response = await api().post<Club>(`/clubs/${clubId}/join`, null, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const leaveClub = async (clubId: number) => {
  const response = await api().delete<Club>(`/clubs/${clubId}/join`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const removeClubMember = async (clubId: number, memberId: number) => {
  const response = await api().delete<Club>(
    `/clubs/${clubId}/members/${memberId}`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};

export const getClubEvents = async (clubId: number) => {
  const response = await api().get<AutoEvent[]>(`/clubs/${clubId}/events`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createClubEvent = async (
  clubId: number,
  payload: CreateEventRequest,
) => createEventAtPath(`/clubs/${clubId}/events`, payload);

export const getClubRoutes = async (clubId: number) => {
  const response = await api().get<UserRoute[]>(`/clubs/${clubId}/routes`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createClubRoute = async (
  clubId: number,
  payload: CreateRouteRequest,
) => {
  const response = await api().post<UserRoute>(`/clubs/${clubId}/routes`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};
