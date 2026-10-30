import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { m } from "@/lib/messages";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Champ de formulaire : label, aide, erreur liée via aria-describedby (l'enfant reçoit id + aria-*). */
export function FormField({ id, label, error, hint, optional, className, children }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">({m.common.optional})</span>}
      </Label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export const fieldA11y = (id: string, error?: string, hint?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});
