import { z } from "zod";
import { m } from "@/lib/messages";

const email = z.string().trim().toLowerCase().min(1, m.validation.required).email(m.validation.email);
const password = z.string().min(8, m.validation.passwordMin).max(72, m.validation.passwordMin);

export const loginSchema = z.object({ email, password: z.string().min(1, m.validation.required) });
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, m.validation.nameMin).max(120),
    email,
    password,
    confirmPassword: z.string(),
    casquette: z.enum(["freelance", "porteur"]),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: m.validation.passwordMatch });
export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: m.validation.passwordMatch });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;

/** N'accepte que des chemins internes (anti open-redirect). */
export function safeNext(next: string | null | undefined, fallback = "/offres"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
