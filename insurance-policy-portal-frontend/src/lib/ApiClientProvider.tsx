"use client";

import { createContext, useContext, type ReactNode } from "react";
import { apiClient, type ApiClient } from "./api";

const ApiClientContext = createContext<ApiClient | null>(null);

interface ApiClientProviderProps {
  children: ReactNode;
}

export function ApiClientProvider({
  children,
}: ApiClientProviderProps) {
  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);

  if (!client) {
    throw new Error("ApiClientProvider is missing from the application tree.");
  }

  return client;
}