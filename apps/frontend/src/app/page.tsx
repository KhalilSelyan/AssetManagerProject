import { trpc } from "@/utils/server-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await trpc.auth.getUser.query();

  if (!data?.user.email) redirect("/login");
  else redirect("/assetlist");
  return null;
}
