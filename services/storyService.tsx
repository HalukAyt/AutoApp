import api from "@/api";
import type { Story } from "@/types/domain";
import { Platform } from "react-native";

import { getAuthHeaders } from "./authTokenService";

interface CreateStoryRequest {
  imageUri: string;
  caption?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  locationName?: string;
  showTimestamp?: boolean;
}

const getMobileFileUri = (imageUri: string) =>
  Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");

const appendImage = (formData: FormData, imageUri: string) => {
  const filename = imageUri.split("/").pop() || "story.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: getMobileFileUri(imageUri),
    name: filename,
    type,
  } as any);
};

const appendTrimmed = (
  formData: FormData,
  key: string,
  value: string | undefined,
) => {
  if (value?.trim()) {
    formData.append(key, value.trim());
  }
};

export const getStories = async () => {
  const response = await api().get<Story[]>("/stories", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createStory = async ({
  imageUri,
  caption,
  musicTitle,
  musicArtist,
  musicUrl,
  locationName,
  showTimestamp = true,
}: CreateStoryRequest) => {
  if (!imageUri) {
    throw new Error("Story fotografi secilmedi.");
  }

  const formData = new FormData();
  appendImage(formData, imageUri);
  appendTrimmed(formData, "caption", caption);
  appendTrimmed(formData, "musicTitle", musicTitle);
  appendTrimmed(formData, "musicArtist", musicArtist);
  appendTrimmed(formData, "musicUrl", musicUrl);
  appendTrimmed(formData, "locationName", locationName);
  formData.append("showTimestamp", String(showTimestamp));

  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}/stories`, {
    method: "POST",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<Story>;
};

export const deleteStory = async (storyId: number) => {
  await api().delete(`/stories/${storyId}`, {
    headers: await getAuthHeaders(),
  });
};