import { TopNav } from "@/components/TopNav";
import { TRPCReactProvider } from "@/utils/react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import { CSRFTokenProvider } from "./provider";
import Footer from "@/components/Footer";
import { trpc } from "@/utils/server-client";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Asset Manager",
  description: "Digital Asset Manager",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await trpc.auth.getUser.query();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Toaster richColors position="bottom-right" />
        <CSRFTokenProvider>
          <TRPCReactProvider>
            <div className="grid grid-rows-[auto_1fr_auto] min-h-screen px-2 md:px-16 container">
              <div>
                <TopNav user={user} />
              </div>
              <main>{children}</main>
              <div>
                <Footer />
              </div>
            </div>
          </TRPCReactProvider>
        </CSRFTokenProvider>
      </body>
    </html>
  );
}
