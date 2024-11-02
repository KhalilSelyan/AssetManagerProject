import MainBody from "@/components/MainBody";
import { trpc } from "@/utils/server-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await trpc.auth.getUser.query();

  if (!data?.user.email) redirect("/login");

  // Only fetch assets if user is authenticated
  const assets = data.user ? await trpc.asset.getAll.query() : null;

  return <MainBody userData={data} initialAssets={assets} />;
}
