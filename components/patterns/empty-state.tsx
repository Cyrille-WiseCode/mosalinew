import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ icon: Icon = SearchX, title, text, action, className }: { icon?: LucideIcon; title: string; text?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass grain grain-soft flex flex-col items-center rounded-lg px-6 py-14 text-center", className)}>
      <span className="mb-3 grid size-10 place-items-center rounded-md bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      {text && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
