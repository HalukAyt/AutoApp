import axios from "axios";

export default function api() {
  const BASE_URL = "https://autotrack-api-pvx4.onrender.com/api";

  return axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });
}
