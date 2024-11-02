import { TransactionTable } from "@/components/TransactionTable";
import { trpc } from "@/utils/server-client";
import React from "react";

export const dynamic = "force-dynamic";

const Page = async ({
  params,
}: {
  params: {
    assetId: string;
  };
}) => {
  const data = await trpc.transaction.getAllForAsset.query({
    assetId: params.assetId,
  });

  return <TransactionTable assetId={params.assetId} initialData={data} />;
};

export default Page;
