import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@assetmanager/backend/trpc/index.js";
import { cookies } from "next/headers";
import { config } from "@/lib/envConfig";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${config.apiRoute}/trpc`,
      headers: () => {
        const csrfToken = cookies().get("csrfToken")?.value;
        // Manually add all cookies to headers
        const cookieHeader = cookies()
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; ");

        return {
          "x-csrf-token": csrfToken ?? "",
          "x-trpc-source": "nextjs-react",
          cookie: cookieHeader, // Pass cookies as a header
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
