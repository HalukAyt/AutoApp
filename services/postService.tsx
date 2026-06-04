import api from "@/api";
import type { FeedPost, PostCommentContent } from "@/types/domain";
import { Platform } from "react-native";

import { getAuthHeaders } from "./authTokenService";

interface CreatePostRequest {
  content: string;
  imageUri?: string | null;
}

interface UpdatePostRequest {
  content: string;
  imageUri?: string | null;
}

const getMobileFileUri = (imageUri: string) =>
  Platform.OS === "android" ? imageUri : imageUri.replace("file://", "");

export const getFeedPosts = async () => {
  const response = await api().get<FeedPost[]>("/posts/feed", {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const createPost = async ({ content, imageUri }: CreatePostRequest) => {
  const formData = new FormData();

  if (content.trim()) {
    formData.append("content", content.trim());
  }

  if (imageUri) {
    const filename = imageUri.split("/").pop() || "post.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: getMobileFileUri(imageUri),
      name: filename,
      type,
    } as any);
  }

  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}/posts/create`, {
    method: "POST",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.text();
};

export const updatePost = async (
  postId: number,
  { content, imageUri }: UpdatePostRequest,
) => {
  const formData = new FormData();
  formData.append("content", content.trim());

  if (imageUri) {
    const filename = imageUri.split("/").pop() || "post.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: getMobileFileUri(imageUri),
      name: filename,
      type,
    } as any);
  }

  const baseUrl = api().defaults.baseURL;
  const response = await fetch(`${baseUrl}/posts/${postId}`, {
    method: "PUT",
    body: formData,
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const deletePost = async (postId: number) => {
  await api().delete(`/posts/${postId}`, {
    headers: await getAuthHeaders(),
  });
};

export const togglePostLike = async (postId: number) => {
  const response = await api().post(`/posts/${postId}/like`, null, {
    headers: await getAuthHeaders(),
  });

  return response.data;
};

export const getPostComments = async (postId: number) => {
  const response = await api().get<PostCommentContent[]>(
    `/posts/${postId}/comments`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};

export const addPostComment = async (postId: number, content: string) => {
  const formData = new FormData();
  formData.append("content", content);

  const response = await api().post(`/posts/${postId}/comment`, formData, {
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
