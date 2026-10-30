"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import { forgotPasswordAction } from "../actions";
import { forgotSchema, type ForgotValues } from "../schemas";
import { useServerError } from "./use-auth-form";

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  const { formError, setFormError, pending, start, apply } = useServerError(setError);

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setFormError(undefined);
      const res = await forgotPasswordAction(values);
      if (res.ok) setSent(true);
      else apply(res);
    }),
  );

  if (sent) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-md border border-success/20 bg-success-soft px-3 py-2.5 text-sm text-success">
        <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {m.auth.forgot.sent}
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="email" label={m.auth.fields.email} error={errors.email?.message}>
        <Input {...register("email")} {...fieldA11y("email", errors.email?.message)} type="email" autoComplete="email" inputMode="email" placeholder={m.auth.fields.emailPlaceholder} />
      </FormField>
      {formError && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">{formError}</p>}
      <Button type="submit" size="lg" loading={pending}>{m.auth.forgot.submit}</Button>
    </form>
  );
}
