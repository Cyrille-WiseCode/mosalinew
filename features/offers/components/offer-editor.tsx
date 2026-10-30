"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, CircleAlert, Loader2, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { PageHeader } from "@/components/patterns/page-header";
import { StatusBadge } from "@/components/patterns/status-badge";
import { isoToDateInput } from "@/lib/format";
import { m } from "@/lib/messages";
import type { Failure } from "@/lib/result";
import { publishOffer, saveOffer } from "../actions";
import { offerFormSchema, type OfferFormValues } from "../schemas";
import { CONTRACT_TYPES, type Category, type OwnerOffer, type Skill } from "../types";
import { OfferActions } from "./offer-actions";
import { PublishDialog } from "./publish-dialog";
import { SkillPicker } from "./skill-picker";
import type { IdentityStatus } from "@/features/profiles/types";

const f = m.offers.form.fields;
type Autosave = "idle" | "saving" | "saved" | "error";

const toFormValues = (o: OwnerOffer): OfferFormValues => ({
  title: o.title,
  description: o.description ?? "",
  categoryId: o.categoryId != null ? String(o.categoryId) : "",
  skillIds: o.skillIds,
  budgetMin: o.budgetMin != null ? String(o.budgetMin) : "",
  budgetMax: o.budgetMax != null ? String(o.budgetMax) : "",
  durationDays: o.durationDays != null ? String(o.durationDays) : "",
  contractType: o.contractType ?? "",
  location: o.location ?? "",
  isRemote: o.isRemote,
  deadline: isoToDateInput(o.deadline),
});

// Clés renvoyées par la RPC (snake_case) -> champs du formulaire
const SERVER_FIELD: Record<string, Path<OfferFormValues>> = {
  description: "description", category_id: "categoryId", budget_min: "budgetMin", budget_max: "budgetMax",
  duration_days: "durationDays", contract_type: "contractType", deadline: "deadline", skills: "skillIds",
};

function missingFields(v: OfferFormValues): Path<OfferFormValues>[] {
  const out: Path<OfferFormValues>[] = [];
  if (v.description.trim().length < 30) out.push("description");
  if (!v.categoryId) out.push("categoryId");
  if (v.skillIds.length === 0) out.push("skillIds");
  if (!v.budgetMin) out.push("budgetMin");
  if (!v.budgetMax) out.push("budgetMax");
  if (!v.durationDays) out.push("durationDays");
  if (!v.contractType) out.push("contractType");
  if (!v.deadline) out.push("deadline");
  return out;
}

const addDays = (n: number) => isoToDateInput(new Date(Date.now() + n * 86_400_000).toISOString());

export function OfferEditor({ offer, categories, skills, identityStatus, pendingCount }: {
  offer: OwnerOffer; categories: Category[]; skills: Skill[]; identityStatus: IdentityStatus; pendingCount: number;
}) {
  const router = useRouter();
  const isDraft = offer.status === "draft";
  const initial = toFormValues(offer);
  const form = useForm<OfferFormValues>({ resolver: zodResolver(offerFormSchema), defaultValues: initial, mode: "onBlur" });
  const { register, control, handleSubmit, watch, setError, setFocus, getValues, trigger, formState: { errors } } = form;

  const [autosave, setAutosave] = useState<Autosave>("idle");
  const [publishOpen, setPublishOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const lastSaved = useRef(JSON.stringify(initial));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlight = useRef(false);

  const reportFailure = (res: Failure) => {
    if (res.code === "UNAUTHENTICATED") {
      toast.error(res.message, { action: { label: m.nav.login, onClick: () => router.push(`/login?next=/mes-offres/${offer.id}`) } });
    } else toast.error(res.message);
    Object.entries(res.fieldErrors ?? {}).forEach(([k, msgs]) => {
      const name = SERVER_FIELD[k] ?? (k as Path<OfferFormValues>);
      setError(name, { message: msgs[0] });
    });
  };

  /** Enregistre si (et seulement si) le contenu a changé et est valide. Retourne false si non enregistré. */
  async function persist(): Promise<boolean> {
    const values = getValues();
    const snapshot = JSON.stringify(values);
    if (snapshot === lastSaved.current) return true;
    if (!offerFormSchema.safeParse(values).success) return false;
    if (inFlight.current) return false;
    inFlight.current = true;
    setAutosave("saving");
    const res = await saveOffer(offer.id, values);
    inFlight.current = false;
    if (res.ok) {
      lastSaved.current = snapshot;
      setAutosave("saved");
      if (JSON.stringify(getValues()) !== snapshot && isDraft) schedule(); // modifié pendant l'envoi
      return true;
    }
    setAutosave("error");
    reportFailure(res);
    return false;
  }
  function schedule() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(), 1200);
  }

  useEffect(() => {
    if (!isDraft) return;
    const sub = watch(() => schedule());
    return () => { sub.unsubscribe(); clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDraft]);

  const focusFirstError = (names: Path<OfferFormValues>[]) => {
    const first = names[0];
    if (first && first !== "skillIds") setFocus(first);
    document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onPublishClick = async () => {
    clearTimeout(timer.current);
    const valid = await trigger();
    if (!valid) return focusFirstError(Object.keys(form.formState.errors) as Path<OfferFormValues>[]);
    const missing = missingFields(getValues());
    if (missing.length) {
      missing.forEach((name) => setError(name, { message: name === "description" ? m.offers.form.fields.descriptionHint : m.errors.requiredField }));
      toast.error(m.errors.MISSING_FIELDS);
      return focusFirstError(missing);
    }
    if (!(await persist())) return;
    setPublishOpen(true);
  };

  const onSaveActive = handleSubmit((values) =>
    startSaving(async () => {
      const res = await saveOffer(offer.id, values);
      if (res.ok) { lastSaved.current = JSON.stringify(values); toast.success(m.offers.toasts.saved); router.refresh(); }
      else reportFailure(res);
    }),
  );

  const err = (n: keyof OfferFormValues) => errors[n]?.message as string | undefined;
  const contractLocked = !isDraft;
  const deadlineLocked = !isDraft;
  const description = watch("description");

  return (
    <>
      <PageHeader
        title={m.offers.form.editTitle}
        description={isDraft ? m.offers.form.editLead : undefined}
        actions={
          <>
            <StatusBadge kind="offer" status={offer.status} />
            {isDraft && <AutosaveIndicator state={autosave} />}
            {isDraft && <Button onClick={onPublishClick}><Send aria-hidden="true" />{m.offers.actions.publish}</Button>}
          </>
        }
      />

      {isDraft && identityStatus !== "approved" && (
        <p role="note" className="mb-5 flex flex-wrap items-center gap-2 rounded-md border border-warning/25 bg-warning-soft px-3 py-2.5 text-sm text-warning">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          {m.offers.mine.verifyBanner}
          <Link href="/verification" className="font-semibold underline underline-offset-2">{m.offers.mine.verifyCta}</Link>
        </p>
      )}

      <form onSubmit={onSaveActive} noValidate className="grid gap-5">
        <Card className="grid gap-5 p-5 sm:p-6">
          <FormField id="field-title" label={f.title} error={err("title")}>
            <Input {...register("title")} {...fieldA11y("field-title", err("title"))} maxLength={120} placeholder={f.titlePlaceholder} />
          </FormField>
          <FormField id="field-description" label={f.description} error={err("description")} hint={`${f.descriptionHint} · ${description.length}/5000`}>
            <Textarea {...register("description")} {...fieldA11y("field-description", err("description"), "x")} rows={8} maxLength={5000} placeholder={f.descriptionPlaceholder} />
          </FormField>
        </Card>

        <Card className="grid gap-5 p-5 sm:p-6">
          <FormField id="field-categoryId" label={f.category} error={err("categoryId")}>
            <Controller control={control} name="categoryId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="field-categoryId" aria-invalid={err("categoryId") ? true : undefined}><SelectValue placeholder={f.categoryPlaceholder} /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </FormField>
          <div id="field-skillIds" className="flex flex-col gap-1.5">
            <Label>{f.skills}</Label>
            <Controller control={control} name="skillIds" render={({ field }) => <SkillPicker skills={skills} value={field.value} onChange={field.onChange} invalid={!!errors.skillIds} />} />
            <p className={errors.skillIds ? "text-xs text-destructive" : "text-xs text-muted-foreground"} role={errors.skillIds ? "alert" : undefined}>{errors.skillIds?.message ?? f.skillsHint}</p>
          </div>
        </Card>

        <Card className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField id="field-budgetMin" label={f.budgetMin} error={err("budgetMin")}>
            <Input {...register("budgetMin")} {...fieldA11y("field-budgetMin", err("budgetMin"))} type="number" inputMode="numeric" min={0} placeholder="500000" />
          </FormField>
          <FormField id="field-budgetMax" label={f.budgetMax} error={err("budgetMax")}>
            <Input {...register("budgetMax")} {...fieldA11y("field-budgetMax", err("budgetMax"))} type="number" inputMode="numeric" min={0} placeholder="800000" />
          </FormField>
          <FormField id="field-durationDays" label={f.duration} error={err("durationDays")}>
            <Input {...register("durationDays")} {...fieldA11y("field-durationDays", err("durationDays"))} type="number" inputMode="numeric" min={1} max={730} placeholder="28" />
          </FormField>
          <FormField id="field-contractType" label={f.contract} error={err("contractType")} hint={contractLocked ? m.offers.form.lockedContract : undefined}>
            <Controller control={control} name="contractType" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={contractLocked}>
                <SelectTrigger id="field-contractType" aria-invalid={err("contractType") ? true : undefined}><SelectValue placeholder={f.contractPlaceholder} /></SelectTrigger>
                <SelectContent>{CONTRACT_TYPES.map((c) => <SelectItem key={c} value={c}>{m.contract[c]}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </FormField>
        </Card>

        <Card className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField id="field-location" label={f.location} error={err("location")} optional>
            <Input {...register("location")} {...fieldA11y("field-location", err("location"))} placeholder={f.locationPlaceholder} maxLength={120} />
          </FormField>
          <div className="flex items-center gap-2.5 self-end pb-2">
            <Controller control={control} name="isRemote" render={({ field }) => <Switch id="field-isRemote" checked={field.value} onCheckedChange={field.onChange} />} />
            <Label htmlFor="field-isRemote">{f.remote}</Label>
          </div>
          <FormField id="field-deadline" label={f.deadline} error={err("deadline")} hint={deadlineLocked ? m.offers.form.lockedDeadline : f.deadlineHint}>
            <Input {...register("deadline")} {...fieldA11y("field-deadline", err("deadline"), "x")} type="date" min={addDays(0)} max={addDays(90)} disabled={deadlineLocked} />
          </FormField>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <OfferActions offer={offer} pendingCount={pendingCount} variant="full" onDeleted="/mes-offres" />
          {!isDraft && <Button type="submit" size="lg" loading={saving}>{m.offers.form.saveActive}</Button>}
        </div>
      </form>

      {isDraft && (
        <PublishDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          values={getValues()}
          categories={categories}
          skills={skills}
          onConfirm={() => publishOffer(offer.id)}
          onSuccess={() => { toast.success(m.offers.toasts.published); router.refresh(); }}
          onFailure={(res) => {
            if (res.code === "MISSING_FIELDS" || res.code === "INVALID_DEADLINE") { setPublishOpen(false); reportFailure(res); }
            if (res.code === "IDENTITY_REQUIRED" || res.code === "CASQUETTE_REQUIRED") {
              setPublishOpen(false);
              toast.error(res.message, res.code === "IDENTITY_REQUIRED" ? { action: { label: m.offers.mine.verifyCta, onClick: () => router.push("/verification") } } : undefined);
            }
          }}
        />
      )}
    </>
  );
}

function AutosaveIndicator({ state }: { state: Autosave }) {
  const label = m.offers.form.autosave[state === "idle" ? "idle" : state];
  return (
    <span role="status" aria-live="polite" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {state === "saving" && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
      {state === "saved" && <Check className="size-3.5 text-success" aria-hidden="true" />}
      {state === "error" && <CircleAlert className="size-3.5 text-destructive" aria-hidden="true" />}
      {label}
    </span>
  );
}
