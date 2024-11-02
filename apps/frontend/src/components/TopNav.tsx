"use client";
import { cn } from "@/lib/utils";
import { trpcReact, utils } from "@/utils/react";
import { trpc } from "@/utils/server-client";
import { inferAsyncReturnType } from "@trpc/server";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useRouter } from "next/navigation";

export function TopNav({
  user,
}: {
  user: inferAsyncReturnType<typeof trpc.auth.getUser.query>;
}) {
  const { data } = trpcReact.auth.getUser.useQuery(undefined, {
    initialData: user,
  });
  const api = utils();
  const router = useRouter();
  const logoutMutation = trpcReact.auth.logout.useMutation({
    onSuccess: () => {
      api.auth.getUser.invalidate();
      api.asset.getAll.invalidate();
      router.push("/");
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // State for notifications
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<
    inferAsyncReturnType<typeof trpc.notification.getAll.query>
  >([]);

  // Fetch notifications
  const notificationsQuery = trpcReact.notification.getAll.useQuery(undefined, {
    onSuccess: (data) => {
      setNotifications(data);
      setHasUnread(data.some((n) => !n.isRead));
    },
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation =
    trpcReact.notification.markAllAsRead.useMutation({
      onSuccess: () => {
        notificationsQuery.refetch();
      },
    });

  // Handle popover open state
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePopoverOpenChange = (open) => {
    setPopoverOpen(open);
    if (open && hasUnread) {
      markAllAsReadMutation.mutate();
      setHasUnread(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 py-2 rounded-xl shadow-lg">
      <Link href="/">
        <span className="text-xl font-bold">Asset Manager</span>
      </Link>

      <div className="flex items-center space-x-4">
        {data?.user.email ? (
          <>
            {/* Notification Bell Icon */}
            <Popover open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "relative p-2 rounded-full hover:bg-accent focus:outline-none",
                    hasUnread ? "animate-shake repeat-1" : ""
                  )}
                >
                  <BellIcon className="w-6 h-6" />
                  {hasUnread && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-90"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 max-h-96 overflow-auto mr-64 mt-4 shadow-lg">
                <div className="p-4">
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 mt-2">No new notifications.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className="border-b p-2 rounded-md hover:bg-accent"
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Welcome, {data?.user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2 items-center">
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/login"
            >
              Login
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/register"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
