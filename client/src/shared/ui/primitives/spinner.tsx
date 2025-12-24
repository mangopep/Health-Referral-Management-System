/**
 * @file client/src/shared/ui/primitives/spinner.tsx
 * @description Reusable UI primitive component
 */

import { Loader2Icon } from "lucide-react"

import { cn } from "@/core/utils/cn"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
