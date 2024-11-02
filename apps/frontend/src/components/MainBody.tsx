"use client";

import { trpcReact } from "@/utils/react";
import { trpc } from "@/utils/server-client";
import { inferAsyncReturnType } from "@trpc/server";
import { AssetTable } from "./AssetTable";

const MainBody = ({
  userData,
  initialAssets,
}: {
  userData: inferAsyncReturnType<typeof trpc.auth.getUser.query>;
  initialAssets: inferAsyncReturnType<typeof trpc.asset.getAll.query> | null;
}) => {
  const { data } = trpcReact.auth.getUser.useQuery(undefined, {
    initialData: userData,
  });

  if (!data?.user.email) return null;

  return <AssetTable initialData={initialAssets} />;
};

export default MainBody;
