import { Search, ShieldCheck, Users } from "lucide-react";
import { m } from "@/lib/messages";

const ICONS = [Search, Users, ShieldCheck];

export function HowItWorks() {
  const h = m.landing.how;
  return (
    <section id="fonctionnement" className="scroll-mt-16 border-y bg-card py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1140px] px-5 sm:px-6">
        <div className="text-center">
          <span className="mb-2 block text-2xs font-semibold tracking-[0.12em] text-primary">{h.kicker}</span>
          <h2 className="text-xl font-semibold tracking-tight">{h.title}</h2>
          <p className="mt-1 text-base text-muted-foreground">{h.lead}</p>
        </div>
        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {h.steps.map((step, i) => {
            const Icon = ICONS[i] ?? Search;
            return (
              <li key={step.title} className="relative text-center">
                <span className="relative mx-auto mb-4 grid size-12 place-items-center rounded-lg border bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 grid size-5 place-items-center rounded-full border-2 border-card bg-primary text-[10px] font-semibold text-primary-foreground" aria-hidden="true">{i + 1}</span>
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mx-auto mt-1 max-w-[260px] text-sm text-muted-foreground">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
