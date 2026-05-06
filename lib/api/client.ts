import axios from "axios";

/**
 * Cliente HTTP para rutas `/api/*` (JSON).
 * Las credenciales de Firebase en cliente siguen usando el SDK en los hooks;
 * axios centraliza errores y URLs para llamadas REST propias.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25_000,
  validateStatus: (s) => s < 500,
});

api.interceptors.response.use(
  (res) => {
    if (res.status >= 400) {
      const msg =
        typeof (res.data as { error?: string })?.error === "string"
          ? (res.data as { error: string }).error
          : `Error ${res.status}`;
      return Promise.reject(new Error(msg));
    }
    return res;
  },
  (err) => {
    if (axios.isAxiosError(err)) {
      const msg =
        (err.response?.data as { error?: string })?.error ??
        err.message ??
        "Error de red";
      return Promise.reject(new Error(msg));
    }
    return Promise.reject(err);
  }
);
