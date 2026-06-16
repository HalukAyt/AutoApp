import api from "@/api";
import type { AutoEvent } from "@/types/domain";
import { Platform } from "react-native";

import { getAuthHeaders } from "./authTokenService";

export interface CreateEventRequest {
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  eventTime: string;
  clubId?: number;
  imageUri?: string | null;
}

const getMobileFileUri = (imageUri: string) =>
  Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");

const appendImage = (formData: FormData, imageUri: string | null | undefined) => {
  if (!imageUri) return;

  const filename = imageUri.split("/").pop() || "event.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: getMobileFileUri(imageUri),
    name: filename,
    type,
  } as any);
};

const buildEventFormData = (payload: CreateEventRequest) => {
  const formData = new FormData();
  formData.append("title", payload.title.trim());
  formData.append("location", payload.location.trim());
  formData.append("eventDate", payload.eventDate);
  formData.append("eventTime", payload.eventTime);

  if (payload.description?.trim()) {
    formData.append("description", payload.description.trim());
  }

  if (payload.clubId !== undefined) {
    formData.append("clubId", String(payload.clubId));
  }

  appendImage(formData, payload.imageUri);

  return formData;
};

export const getEvents = async () => {
  const response = await api().get<AutoEvent[]>("/events", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const getEvent = async (eventId: number) => {
  const response = await api().get<AutoEvent>(`/events/${eventId}`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createEventAtPath = async (
  path: string,
  payload: CreateEventRequest,
) => {
  const formData = buildEventFormData(payload);
  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<AutoEvent>;
};

export const createEvent = async (payload: CreateEventRequest) =>
  createEventAtPath("/events", payload);

export const joinEvent = async (eventId: number) => {
  const response = await api().post<AutoEvent>(`/events/${eventId}/join`, null, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const leaveEvent = async (eventId: number) => {
  const response = await api().delete<AutoEvent>(`/events/${eventId}/join`, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const updateEvent = async (
  eventId: number,
  payload: CreateEventRequest,
) => {
  if (payload.imageUri) {
    const formData = buildEventFormData(payload);
    const baseUrl = api().defaults.baseURL;
    const response = await fetch(`${baseUrl}/events/${eventId}`, {
      method: "PUT",
      body: formData,
      headers: await getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json() as Promise<AutoEvent>;
  }

  const response = await api().put<AutoEvent>(`/events/${eventId}`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const deleteEvent = async (eventId: number) => {
  await api().delete(`/events/${eventId}`, {
    headers: await getAuthHeaders(),
  });
};
