import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className }: { className?: string }) {
  return (
    <CheckCircle
      className={cn("h-4 w-4 text-blue-500 inline-block", className)}
      aria-label="Verified organizer"
    />
  );
}
