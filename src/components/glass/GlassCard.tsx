import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  gradient?: boolean;
  hoverable?: boolean;
}

export function GlassCard({ children, className, gradient = false, hoverable = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl relative overflow-hidden",
        hoverable && "glass-hover cursor-pointer",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

