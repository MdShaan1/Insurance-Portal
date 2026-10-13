"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ApiClient } from "./api";

const ApiClientContext = createContext<ApiClient | null>(null);

interface ApiClientProviderProps {
  client: ApiClient;
  children: ReactNode;
}

export function ApiClientProvider({
  client,
  children,
}: ApiClientProviderProps) {
  return (
    <ApiClientContext.Provider value={client}>
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
