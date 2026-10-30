import { Briefcase, Code, Database, FileText, ListChecks, Megaphone, PenLine, type LucideIcon } from "lucide-react";

const ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  "Développement": { icon: Code, tone: "bg-info-soft text-info" },
  "Design & UX": { icon: PenLine, tone: "bg-accent text-accent-foreground" },
  "Marketing & stratégie": { icon: Megaphone, tone: "bg-warning-soft text-warning" },
  "Rédaction & traduction": { icon: FileText, tone: "bg-muted text-muted-foreground" },
  "Data & analyse": { icon: Database, tone: "bg-success-soft text-success" },
  "Gestion de projet": { icon: ListChecks, tone: "bg-muted text-muted-foreground" },
};

export function CategoryIcon({ name }: { name: string | null }) {
  const { icon: Icon, tone } = (name && ICONS[name]) || { icon: Briefcase, tone: "bg-muted text-muted-foreground" };
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-md ${tone}`}>
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}
