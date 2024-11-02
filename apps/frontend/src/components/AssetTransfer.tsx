"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpcReact } from "@/utils/react";

// Form validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TransferFormProps {
  assetId: string;
  onSuccess?: () => void;
}

export function TransferForm({ assetId, onSuccess }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize tRPC queries and mutations
  const getUserByEmail = trpcReact.auth.getByEmail.useMutation();
  const transferAsset = trpcReact.asset.transfer.useMutation({
    onSuccess: (data) => {
      toast.success("Asset Transferred", {
        description: `${data?.name} has been transferred successfully.`,
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Transfer Failed", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      // First, lookup the user by email
      const user = await getUserByEmail.mutateAsync(values.email);

      if (!user) {
        toast.error("User Not Found", {
          description: "No user was found with that email address.",
        });
        setIsSubmitting(false);
        return;
      }

      // Then transfer the asset to the found user
      await transferAsset.mutateAsync({
        assetId,
        toUserId: user.id,
      });
    } catch (err) {
      console.error(err);
      toast.error("Lookup Failed", {
        description: "Failed to find user. Please try again.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter recipient's email"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the email address of the user you want to transfer this
                asset to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Transferring..." : "Transfer Asset"}
        </Button>
      </form>
    </Form>
  );
}
