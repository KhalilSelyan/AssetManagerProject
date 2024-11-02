// lib/config.ts
export const config = {
  apiRoute: process.env.NEXT_PUBLIC_API_ROUTE || "http://localhost:3001",
} as const;
