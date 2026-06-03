import api from "@/api";
import type { FeedPost, PostCommentContent } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

export const getFeedPosts = async () => {
  const response = await api().get<FeedPost[]>("/posts/feed", {
    headers: await getAuthHeaders(),
  });

  return response.data;
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