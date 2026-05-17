import { GlassCard } from "./GlassCard";
import { cn } from "@/lib/utils";

interface KpiWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiWidget({ title, value, subtitle, trend, trendValue, icon, className }: KpiWidgetProps) {
  return (
    <GlassCard className={cn("p-6 flex flex-col justify-between hover:border-white/20", className)} gradient>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div>
        <div className="text-3xl font-semibold text-white tracking-tight">{value}</div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            {trendValue && (
              <span
                className={cn(
                  "font-medium",
                  trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-muted-foreground"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            )}
            {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
