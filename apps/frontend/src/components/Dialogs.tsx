"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AssetForm } from "./AssetAdd";
import { TransferForm } from "./AssetTransfer";
import { utils } from "@/utils/react";

interface AssetFormDialogProps {
  children: React.ReactNode;
}

export function AssetFormDialog({ children }: AssetFormDialogProps) {
  const [open, setOpen] = useState(false);
  const api = utils();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[20rem] md:max-w-[26rem]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Create a new digital asset in your collection.
          </DialogDescription>
        </DialogHeader>
        <AssetForm
          onSuccess={() => {
            void api.asset.getAll.invalidate();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TransferFormDialogProps {
  assetId: string;
}

export function TransferFormDialog({ assetId }: TransferFormDialogProps) {
  const [open, setOpen] = useState(false);
  const api = utils();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[20rem] md:max-w-[26rem]">
        <DialogHeader>
          <DialogTitle>Transfer Asset</DialogTitle>
          <DialogDescription>
            Transfer an asset to another user.
          </DialogDescription>
        </DialogHeader>
        <TransferForm
          assetId={assetId}
          onSuccess={() => {
            void api.asset.getAll.invalidate();
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
