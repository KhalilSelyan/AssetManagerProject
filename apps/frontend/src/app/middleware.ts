import { NextResponse } from "next/server";
import { config as envConfig } from "@/lib/envConfig";

export async function middleware() {
  const csrfRes = await fetch(`${envConfig.apiRoute}/api/csrf_token`, {
    credentials: "include",
  });
  const data = await csrfRes.json();

  // Add CSRF token as a cookie for Next.js
  const res = NextResponse.next();
  res.cookies.set("csrfToken", data.token);
  return res;
}

export const config = {
  matcher: "/:path*",
};
