import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bouton : grain « sérigraphie » très visible (grain-print), aucun dégradé,
 * rayon 6 px (≥ 4 px), retour tactile spring 160 ms.
 */
export const buttonVariants = cva(
  "grain grain-print relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium select-none " +
    "transition-[transform,background-color,border-color,box-shadow] duration-[160ms] ease-[var(--ease-spring)] active:scale-[0.975] " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary text-primary-foreground shadow-z1 hover:bg-primary-hover",
        secondary: "grain-medium border-border bg-card text-foreground shadow-z1 hover:bg-muted",
        ghost: "grain-soft border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        destructive: "border-destructive/30 bg-destructive text-background shadow-z1 hover:opacity-90",
        light: "grain-medium border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20",
      },
      size: {
        sm: "h-8 px-2.5 text-xs md:h-7",
        md: "h-10 px-3.5 text-sm md:h-8",
        lg: "h-11 px-4 text-sm md:h-9",
        icon: "size-9 md:size-8",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; loading?: boolean };

export function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? children : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  );
}
