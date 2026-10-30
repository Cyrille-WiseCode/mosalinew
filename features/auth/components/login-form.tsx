"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import { loginAction } from "../actions";
import { loginSchema, type LoginValues } from "../schemas";
import { useServerError } from "./use-auth-form";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { formError, setFormError, pending, start, apply } = useServerError(setError);

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setFormError(undefined);
      const res = await loginAction(values, next);
      if (res.ok) {
        router.replace(res.data.redirectTo);
        router.refresh();
      } else apply(res);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="email" label={m.auth.fields.email} error={errors.email?.message}>
        <Input {...register("email")} {...fieldA11y("email", errors.email?.message)} type="email" autoComplete="email" inputMode="email" placeholder={m.auth.fields.emailPlaceholder} />
      </FormField>
      <FormField id="password" label={m.auth.fields.password} error={errors.password?.message}>
        <PasswordInput {...register("password")} {...fieldA11y("password", errors.password?.message)} autoComplete="current-password" />
      </FormField>
      <Link href="/forgot-password" className="-mt-2 self-end text-xs font-medium text-primary hover:underline">{m.auth.login.forgot}</Link>
      {formError && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">{formError}</p>}
      <Button type="submit" size="lg" loading={pending}>{m.auth.login.submit}<ArrowRight aria-hidden="true" /></Button>
    </form>
  );
}
