// frontend/lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // backend
  withCredentials: true,            // importante para enviar cookies
});

export default api;
