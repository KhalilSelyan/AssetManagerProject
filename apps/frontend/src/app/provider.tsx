"use client";
import React, { useEffect } from "react";
import { config } from "@/lib/envConfig";
export function CSRFTokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    async function fetchCsrfToken() {
      const response = await fetch(`${config.apiRoute}/api/csrf_token`, {
        credentials: "include",
      });
      const data = await response.json();
      // Set the CSRF token cookie
      document.cookie = `csrfToken=${data.token}; path=/;`;
    }

    fetchCsrfToken();
  }, []);

  return <>{children}</>;
}
