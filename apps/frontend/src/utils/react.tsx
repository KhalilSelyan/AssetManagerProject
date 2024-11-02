"use client";

import type { AppRouter } from "@assetmanager/backend/trpc";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink, loggerLink } from "@trpc/react-query";
import { useEffect, useMemo } from "react";
import { createQueryClient } from "./query-client";
import { config } from "@/lib/envConfig";

// Singleton pattern for QueryClient to maintain consistent cache across renders
let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // On server-side, create new client to avoid sharing state between requests
    return createQueryClient();
  }
  // On client-side, reuse the same query client instance
  return (clientQueryClientSingleton ??= createQueryClient());
};

// Create TRPC client with type safety from our API router
export const trpcReact = createTRPCReact<AppRouter>();

// Utility to access TRPC's utility functions (like prefetching, invalidating cache)
export const utils = () => trpcReact.useUtils();

// Main provider component that sets up TRPC with React Query
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // Fetch CSRF token on component mount and store it in a cookie
  useEffect(() => {
    async function fetchCsrfToken() {
      const response = await fetch(`${config.apiRoute}/api/csrf_token`, {
        credentials: "include", // Include cookies in request
      });
      const data = await response.json();
      document.cookie = `csrfToken=${data.token}; path=/;`;
    }

    fetchCsrfToken();
  }, []);

  // Create TRPC client with necessary configuration
  const trpcClient = useMemo(() => {
    return trpcReact.createClient({
      links: [
        // Add logging in development and for errors
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        // Configure HTTP batch link for API requests
        httpBatchLink({
          url: getBaseUrl() + "/trpc",
          headers: () => {
            // Include CSRF token in headers for security
            const csrfToken = getCookie("csrfToken");
            return {
              "x-csrf-token": csrfToken ?? "",
              "x-trpc-source": "nextjs-react",
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include", // Include cookies
            });
          },
        }),
      ],
    });
  }, []); // Memoize to avoid unnecessary recreations

  return (
    <QueryClientProvider client={queryClient}>
      <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </trpcReact.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  return `${config.apiRoute}`;
}

// Utility function to safely get cookie values
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    // Return null if running on server
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}
