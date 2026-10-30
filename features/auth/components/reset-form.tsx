"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField, fieldA11y } from "@/components/patterns/form-field";
import { m } from "@/lib/messages";
import { resetPasswordAction } from "../actions";
import { resetSchema, type ResetValues } from "../schemas";
import { useServerError } from "./use-auth-form";

export function ResetForm() {
  const router = useRouter();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirmPassword: "" } });
  const { formError, setFormError, pending, start, apply } = useServerError(setError);

  const onSubmit = handleSubmit((values) =>
    start(async () => {
      setFormError(undefined);
      const res = await resetPasswordAction(values);
      if (res.ok) {
        toast.success(m.auth.reset.done);
        router.replace("/offres");
        router.refresh();
      } else apply(res);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="password" label={m.auth.fields.password} error={errors.password?.message}>
        <PasswordInput {...register("password")} {...fieldA11y("password", errors.password?.message)} autoComplete="new-password" placeholder={m.auth.fields.passwordPlaceholder} />
      </FormField>
      <FormField id="confirmPassword" label={m.auth.fields.confirmPassword} error={errors.confirmPassword?.message}>
        <PasswordInput {...register("confirmPassword")} {...fieldA11y("confirmPassword", errors.confirmPassword?.message)} autoComplete="new-password" />
      </FormField>
      {formError && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive-soft px-3 py-2 text-xs text-destructive">{formError}</p>}
      <Button type="submit" size="lg" loading={pending}>{m.auth.reset.submit}</Button>
    </form>
  );
}
