/**
 * @file client/src/shared/ui/composites/metric-card.tsx
 * @description Dashboard metric card with icon, value, and trend indicator
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/primitives/card";
import { cn } from "@/core/utils/cn";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconColor?: string;
  bgColor?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  className,
  iconColor = "text-primary",
  bgColor = "bg-blue-50 dark:bg-blue-950/30"
}: MetricCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden premium-card relative",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={cn(
          "p-3 rounded-lg",
          bgColor
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-foreground tabular-nums tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-3 text-xs">
            {trend && (
              <span className={cn(
                "font-semibold px-2.5 py-1.5 rounded-full text-xs",
                trendUp
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
              )}>
                {trend}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground font-medium">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
