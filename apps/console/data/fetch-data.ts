import axios, {
  AxiosError,
  type AxiosRequestConfig,
} from "axios";
import { AppError } from "@/errors";

const http = axios.create({
  timeout: 15_000,
  headers: {
    Accept: "application/json",
  },
});

export async function fetchData<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await http.request<T>({
      url,
      method: "GET",
      ...config,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AppError({
        code:
          error.response?.status === 404
            ? "NOT_FOUND"
            : "UPSTREAM_UNAVAILABLE",
        message:
          error.message || "Data request failed.",
        status: error.response?.status ?? 503,
        details: error.response?.data,
      });
    }
    throw error;
  }
}
