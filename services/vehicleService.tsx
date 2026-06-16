import api from "@/api";
import type { Vehicle } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

export type { Vehicle } from "@/types/domain";

export interface AddVehicleRequest {
  licensePlate?: string;
  brand: string;
  model: string;
  year: string | number;
  inspectionAppointmentDate?: string;
  imageUri?: string | null;
}

export interface AddVehicleExpenseRequest {
  category: string;
  amount: number;
  date?: string;
}

export interface UpdateVehicleRequest {
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  inspectionAppointmentDate?: string;
  imageUri?: string | null;
}

const getImageMimeType = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic" || extension === "heif") return "image/heic";

  return "image/jpeg";
};

const appendImage = (
  formData: FormData,
  fieldName: string,
  imageUri: string | null | undefined,
  fallbackName: string,
) => {
  if (!imageUri) return;

  const filename = imageUri.split("/").pop()?.split("?")[0] || fallbackName;

  formData.append(fieldName, {
    uri: imageUri,
    name: filename,
    type: getImageMimeType(filename),
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

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
};

export const getActiveVehicle = async () => {
  const response = await api().get<Vehicle>("/vehicle/activeVehicle", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const getExploreVehicles = async () => {
  const response = await api().get<Vehicle[]>("/vehicles/explore", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const setActiveVehicle = async (vehicleId: number) => {
  const response = await api().post<string>(`/vehicle/${vehicleId}/activate`, null, {
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
  if (payload.inspectionAppointmentDate?.trim()) {
    formData.append(
      "inspectionAppointmentDate",
      payload.inspectionAppointmentDate.trim(),
    );
  }
  appendImage(formData, "file", payload.imageUri, "vehicle.jpg");

  return submitVehicleForm<string>("/vehicle/add", "POST", formData);
};

export const addVehicleExpense = async (
  vehicleId: number,
  payload: AddVehicleExpenseRequest,
) => {
  await api().post(`/vehicle/${vehicleId}/expenses`, payload, {
    headers: await getAuthHeaders(),
  });
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
  formData.append("inspectionAppointmentDate", payload.inspectionAppointmentDate ?? "");
  appendImage(formData, "image", payload.imageUri, "vehicle_image.jpg");

  return submitVehicleForm<Vehicle>(`/vehicle/${vehicleId}`, "PUT", formData);
};
