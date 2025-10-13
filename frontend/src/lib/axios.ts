// frontend/lib/axios.ts
import axios from "axios";

const getBaseURL = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000`;
  }

  return "http://localhost:3000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default api;
