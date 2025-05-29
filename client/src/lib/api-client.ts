// lib/api-client.ts
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useMemo } from "react";

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
};

interface ApiErrorData {
  message?: string;
  [key: string]: unknown;
}

class ApiError extends Error {
  status: number;
  data: ApiErrorData | null;

  constructor(message: string, status: number, data: ApiErrorData | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.token || localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const config: RequestInit = {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...headers,
      },
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error or request failed", 0, null);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }
}

export const apiClient = new ApiClient();

import { useState, useEffect } from "react";

export function useApi<T>(
  endpoint: string,
  options: ApiOptions = {},
  dependencies: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [
    options.method,
    options.body,
    JSON.stringify(options.headers),
  ]);

  const fetchData = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      setError(new ApiError("Not authenticated", 401, null));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.request<T>(endpoint, memoizedOptions);
      setData(result);
    } catch (err) {
      setError(err as ApiError);
      console.error(`API Error for ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, token, isAuthenticated, authLoading, memoizedOptions, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = async () => {
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.request<T>(endpoint, memoizedOptions);
      setData(result);
      return result;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading: loading || authLoading,
    error,
    refetch,
    isAuthenticated,
  };
}

export function useApiClient() {
  const { token } = useAuth();

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  return apiClient;
}