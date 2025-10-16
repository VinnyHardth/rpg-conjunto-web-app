import axios from "axios";

export const api = axios.create({
  baseURL: "/api", // agora o Next faz o proxy
  withCredentials: true,
});

export default api;
