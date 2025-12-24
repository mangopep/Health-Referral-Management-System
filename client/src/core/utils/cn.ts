/**
 * @file client/src/core/utils/cn.ts
 * @description Tailwind CSS class name utility combining clsx and tailwind-merge
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
