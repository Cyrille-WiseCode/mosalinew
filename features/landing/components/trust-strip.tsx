import { m } from "@/lib/messages";

// Chiffres statiques (maquette d'origine) — à brancher sur des compteurs réels (vue SQL dédiée).
export function TrustStrip() {
  const t = m.landing.trust;
  return (
    <section className="border-b bg-card">
      <div className="mx-auto grid w-full max-w-[1140px] items-center gap-y-4 px-5 py-6 sm:px-6 md:grid-cols-[2fr_repeat(3,1fr)]">
        <p className="col-span-full md:col-span-1">
          <strong className="block text-base font-semibold">{t.title}</strong>
          <span className="mt-0.5 block text-sm text-muted-foreground">{t.lead}</span>
        </p>
        {t.stats.map((s) => (
          <div key={s.label} className="md:border-l md:pl-6">
            <strong className="block text-xl font-semibold tracking-tight tabular-nums">{s.value}</strong>
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
