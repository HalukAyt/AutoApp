import api from "@/api";
import type { Vehicle } from "@/types/domain";
import { Platform } from "react-native";

import { getAuthHeaders } from "./authTokenService";

export type { Vehicle } from "@/types/domain";

export interface AddVehicleRequest {
  licensePlate?: string;
  brand: string;
  model: string;
  year: string | number;
  imageUri?: string | null;
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  imageUri?: string | null;
}

const getMobileFileUri = (imageUri: string) =>
  Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");

const appendImage = (
  formData: FormData,
  fieldName: string,
  imageUri: string | null | undefined,
  fallbackName: string,
) => {
  if (!imageUri) return;

  const filename = imageUri.split("/").pop() || fallbackName;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append(fieldName, {
    uri: getMobileFileUri(imageUri),
    name: filename,
    type,
  } as any);
};

const submitVehicleForm = async <T,>(
  endpoint: string,
  method: "POST" | "PUT",
  formData: FormData,
) => {
  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return (await response.json()) as T;
};

export const getActiveVehicle = async () => {
  const response = await api().get<Vehicle>("/vehicle/activeVehicle", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const addVehicle = async (payload: AddVehicleRequest) => {
  const formData = new FormData();

  if (payload.licensePlate?.trim()) {
    formData.append("licensePlate", payload.licensePlate.trim());
  }

  formData.append("brand", payload.brand);
  formData.append("model", payload.model);
  formData.append("year", String(payload.year));
  appendImage(formData, "file", payload.imageUri, "vehicle.jpg");

  return submitVehicleForm<Vehicle>("/vehicle/add", "POST", formData);
};

export const updateVehicle = async (
  vehicleId: number,
  payload: UpdateVehicleRequest,
) => {
  const formData = new FormData();

  formData.append("brand", payload.brand);
  formData.append("model", payload.model);
  formData.append("year", String(payload.year));
  formData.append("licensePlate", payload.licensePlate ?? "");
  appendImage(formData, "image", payload.imageUri, "vehicle_image.jpg");

  return submitVehicleForm<Vehicle>(`/vehicle/${vehicleId}`, "PUT", formData);
};