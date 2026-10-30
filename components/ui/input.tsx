import * as React from "react";
import { cn } from "@/lib/utils";

export const fieldBase =
  "grain grain-soft w-full rounded-md border border-input bg-card px-3 text-sm text-foreground shadow-z1 placeholder:text-muted-foreground/80 " +
  "transition-[border-color,box-shadow] duration-[160ms] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldBase, "h-10 md:h-9", className)} {...props} />;
}
