import { cn } from "@/utils/cn";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[#E6F2F2] text-[#178F8E]",
  success: "bg-green-50 text-green-700 border border-green-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  danger: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-blue-50 text-blue-700 border border-blue-200",
  neutral: "bg-gray-100 text-gray-600",
};

const JOB_STATUS_MAP: Record<string, BadgeVariant> = {
  PENDING: "warning",
  MATCHING: "info",
  ASSIGNED: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const JOB_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  MATCHING: "Recherche artisan",
  ASSIGNED: "Artisan assigné",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function JobStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={JOB_STATUS_MAP[status] ?? "neutral"}>
      {JOB_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}
