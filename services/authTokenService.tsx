import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";

export type AuthHeaders = {
  Authorization?: string;
};

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);

export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export const getAuthHeaders = async (): Promise<AuthHeaders> => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};