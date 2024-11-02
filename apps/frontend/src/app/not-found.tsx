import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-4">
        <div className="relative w-60 h-60 mx-auto">
          <svg
            className="absolute inset-0"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M43.5,-59.5C56.6,-53.4,67.6,-41.1,73.5,-26.5C79.3,-11.9,79.9,5,74.3,19.2C68.8,33.4,57,45,44,54.6C31,64.2,16.8,71.8,0.6,71C-15.6,70.3,-31.2,61.3,-45.6,51.1C-60,40.9,-73.2,29.5,-76.8,15.1C-80.5,0.7,-74.6,-16.6,-65.5,-30.3C-56.4,-44,-44,-54.1,-31.1,-60.3C-18.2,-66.6,-4.6,-69,8.1,-80.1C20.8,-91.2,41.6,-111,50.7,-106.6C59.8,-102.2,57.2,-73.6,43.5,-59.5Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-background text-9xl font-bold">
            404
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Page not found
        </h1>
        <p className="max-w-[600px] text-muted-foreground mx-auto">
          Oops! It seems like you&apos;ve wandered into uncharted territory. The
          page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/" className="inline-flex items-center justify-center">
              <HomeIcon className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
