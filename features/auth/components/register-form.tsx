"use client";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Briefcase, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { cn } from "@/lib/utils";
import { m } from "@/lib/messages";
import { registerAction } from "../actions";
import { registerSchema, type RegisterValues } from "../schemas";
import { useServerError } from "./use-auth-form";

const CHOICES = [
  { value: "freelance", icon: UserRound, label: m.auth.register.freelance, hint: m.auth.register.freelanceHint },
  { value: "porteur", icon: Briefcase, label: m.auth.register.porteur, hint: m.auth.register.porteurHint },
] as const;

export function RegisterForm({ defaultCasquette = "freelance" }: { defaultCasquette?: "freelance" | "porteur" }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", casquette: defaultCasquette },
  });
  const { formError, setFormError, pending, start, apply } = useServerError(setError);

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setFormError(undefined);
      const res = await registerAction(values);
      if (res.ok) router.replace(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
      else apply(res);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Controller
        control={control}
        name="casquette"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-xs font-medium">{m.auth.register.iAm}</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {CHOICES.map(({ value, icon: Icon, label, hint }) => {
                const selected = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => field.onChange(value)}
                    className={cn(
                      "grain grain-soft flex flex-col items-start gap-1 rounded-md border bg-card p-3 text-left transition-[border-color,box-shadow,transform] duration-[160ms] ease-[var(--ease-spring)] active:scale-[0.98]",
                      selected ? "border-primary ring-[3px] ring-ring/20" : "border-input hover:border-primary/40",
                    )}
                  >
                    <Icon className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-2xs text-muted-foreground">{hint}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      />
      <FormField id="fullName" label={m.auth.fields.fullName} error={errors.fullName?.message}>
        <Input {...register("fullName")} {...fieldA11y("fullName", errors.fullName?.message)} autoComplete="name" placeholder={m.auth.fields.fullNamePlaceholder} />
      </FormField>
      <FormField id="email" label={m.auth.fields.email} error={errors.email?.message}>
        <Input {...register("email")} {...fieldA11y("email", errors.email?.message)} type="email" autoComplete="email" inputMode="email" placeholder={m.auth.fields.emailPlaceholder} />
      </FormField>
      <FormField id="password" label={m.auth.fields.password} error={errors.password?.message}>
        <PasswordInput {...register("password")} {...fieldA11y("password", errors.password?.message)} autoComplete="new-password" placeholder={m.auth.fields.passwordPlaceholder} />
      </FormField>
      <FormField id="confirmPassword" label={m.auth.fields.confirmPassword} error={errors.confirmPassword?.message}>
        <PasswordInput {...register("confirmPassword")} {...fieldA11y("confirmPassword", errors.confirmPassword?.message)} autoComplete="new-password" />
      </FormField>
      {formError && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">{formError}</p>}
      <Button type="submit" size="lg" loading={pending}>{m.auth.register.submit}<ArrowRight aria-hidden="true" /></Button>
      <p className="text-center text-2xs text-muted-foreground">{m.auth.register.terms}</p>
    </form>
  );
}
