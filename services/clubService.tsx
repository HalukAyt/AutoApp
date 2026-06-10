import api from "@/api";
import type { AutoEvent, Club, UserRoute } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";
import { createEventAtPath, type CreateEventRequest } from "./eventService";
import type { CreateRouteRequest } from "./routeService";

export interface CreateClubRequest {
  name: string;
  description?: string;
}

export const getClubs = async () => {
  const response = await api().get<Club[]>("/clubs", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createClub = async (payload: CreateClubRequest) => {
  const response = await api().post<Club>("/clubs", payload, {
    headers: await getAuthHeaders(),
  });

  return response.data;
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