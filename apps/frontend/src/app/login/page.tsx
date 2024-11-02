import { LoginForm } from "@/components/LoginForm";
import { trpc } from "@/utils/server-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const data = await trpc.auth.getUser.query();

  if (data?.user.email) {
    redirect("/assetlist");
  }
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <LoginForm />
    </div>
  );
}
