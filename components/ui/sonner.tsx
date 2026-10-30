"use client";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

/** Toasts : en haut, centrés, verre semi-transparent, bordure harmonique. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      position="top-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      offset={16}
      toastOptions={{
        classNames: {
          toast: "!glass !grain !grain-soft !rounded-lg !border !border-border !bg-popover/80 !text-foreground !shadow-z2 !text-sm",
          description: "!text-muted-foreground",
          success: "!border-success/30",
          error: "!border-destructive/30",
          warning: "!border-warning/30",
          info: "!border-info/30",
        },
      }}
    />
  );
}
