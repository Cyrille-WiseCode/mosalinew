import { Card } from "@/components/ui/card";

export function AuthCard({ title, lead, icon, children, footer }: { title: string; lead: string; icon?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Card className="w-full max-w-[400px] p-7 shadow-z2">
      {icon && <span className="mb-4 grid size-9 place-items-center rounded-md bg-accent text-accent-foreground">{icon}</span>}
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 mb-6 text-base text-muted-foreground">{lead}</p>
      {children}
      {footer && <div className="mt-5 text-center text-xs text-muted-foreground">{footer}</div>}
    </Card>
  );
}
