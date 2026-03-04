import { cn } from "@/utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddings: Record<string, string> = { none: "", sm: "p-3", md: "p-5", lg: "p-6" };
  return (
    <div
      className={cn(
        "bg-white border border-[#D1E5E5] rounded-[10px] shadow-sm",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 pb-3 border-b border-[#E6F2F2]", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-[#1F2937]", className)}>
      {children}
    </h3>
  );
}
