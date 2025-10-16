import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

// Em produção, usa a URL absoluta da variável de ambiente.
// Em desenvolvimento, usa um caminho relativo para que o Nginx possa fazer o proxy.
const API_BASE_URL = isProduction ? process.env.NEXT_PUBLIC_API_URL : "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Essencial para enviar cookies de sessão em requisições cross-origin
});

export default api;
