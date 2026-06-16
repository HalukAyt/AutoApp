import api from "@/api";
import type { DirectConversation, DirectMessage } from "@/types/domain";

import { getAuthHeaders } from "./authTokenService";

const cleanUsername = (username: string) => username.replace(/^@/, "").trim();

export const getDirectConversations = async () => {
  const response = await api().get<DirectConversation[]>(
    "/direct/conversations",
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};

export const getDirectMessages = async (username: string) => {
  const response = await api().get<DirectMessage[]>(
    `/direct/users/${encodeURIComponent(cleanUsername(username))}/messages`,
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};

export const sendDirectMessage = async (username: string, content: string) => {
  const response = await api().post<DirectMessage>(
    `/direct/users/${encodeURIComponent(cleanUsername(username))}/messages`,
    { content: content.trim() },
    {
      headers: await getAuthHeaders(),
    },
  );

  return response.data;
};
