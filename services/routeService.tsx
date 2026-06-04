import api from "@/api";
import type { UserRoute } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

export interface CreateRouteRequest {
  title: string;
  startPoint?: string;
  endPoint?: string;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  distance: number;
  duration: number;
}

export const createRoute = async (payload: CreateRouteRequest) => {
  const response = await api().post<UserRoute>("/routes/create", payload, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const updateRoute = async (
  routeId: number,
  payload: CreateRouteRequest,
) => {
  const response = await api().put<UserRoute>(`/routes/${routeId}`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const deleteRoute = async (routeId: number) => {
  await api().delete(`/routes/${routeId}`, {
    headers: await getAuthHeaders(),
  });
};

export const getExploreRoutes = async () => {
  const response = await api().get<UserRoute[]>("/routes/explore", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};
