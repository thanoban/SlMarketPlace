import Badge from "./ui/Badge";
import type { EventStatus } from "@/lib/constants";

const statusConfig: Record<EventStatus, { label: string; variant: "blue" | "green" | "yellow" | "red" | "gray" | "purple" }> = {
  pending: { label: "Pending", variant: "yellow" },
  approved: { label: "Approved", variant: "blue" },
  scheduled: { label: "Scheduled", variant: "purple" },
  published: { label: "Published", variant: "green" },
  rejected: { label: "Rejected", variant: "red" },
};

export default function StatusBadge({ status }: { status: EventStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
