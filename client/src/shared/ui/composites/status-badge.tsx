/**
 * @file client/src/shared/ui/composites/status-badge.tsx
 * @description Referral status badge with semantic color variants
 */

import { cn } from "@/core/utils/cn";
import { Badge } from "@/shared/ui/primitives/badge";
import { Status } from "@/features/referrals/domain/models";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let customClass = "";

  switch (status) {
    case "COMPLETED":
      customClass = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800 dark:hover:bg-emerald-900/50 font-semibold";
      break;
    case "CANCELLED":
      customClass = "bg-red-100 text-red-700 hover:bg-red-200 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800 dark:hover:bg-red-900/50 font-semibold";
      break;
    case "SCHEDULED":
      customClass = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800 dark:hover:bg-blue-900/50 font-semibold";
      break;
    case "SENT":
      customClass = "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800 dark:hover:bg-purple-900/50 font-semibold";
      break;
    case "ACKNOWLEDGED":
      customClass = "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900/50 font-semibold";
      break;
    case "CREATED":
      customClass = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300 dark:bg-slate-800/50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50 font-semibold";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-1 rounded-full capitalize shadow-none border transition-all duration-200 hover:shadow-md hover:scale-105",
        customClass,
        className
      )}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
