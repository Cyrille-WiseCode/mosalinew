"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import { createOfferDraft } from "../actions";
import { createOfferSchema } from "../schemas";
import { useState, useTransition } from "react";

type Values = { title: string };

export function CreateOfferForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [formError, setFormError] = useState<string>();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(createOfferSchema), defaultValues: { title: "" } });

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setFormError(undefined);
      const res = await createOfferDraft(values);
      if (res.ok) {
        toast.success(m.offers.toasts.created);
        router.push(`/mes-offres/${res.data.id}`);
      } else {
        setFormError(res.message);
        if (res.fieldErrors?.title?.[0]) setError("title", { message: res.fieldErrors.title[0] });
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-lg flex-col gap-4">
      <FormField id="title" label={m.offers.form.fields.title} error={errors.title?.message}>
        <Input {...register("title")} {...fieldA11y("title", errors.title?.message)} placeholder={m.offers.form.fields.titlePlaceholder} maxLength={120} autoFocus />
      </FormField>
      {formError && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">{formError}</p>}
      <div><Button type="submit" size="lg" loading={pending}>{m.offers.form.createSubmit}<ArrowRight aria-hidden="true" /></Button></div>
    </form>
  );
}
