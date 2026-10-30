"use client";
import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { Failure } from "@/lib/result";

/** Applique un échec serveur : erreurs par champ + message global. */
export function useServerError<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [formError, setFormError] = useState<string>();
  const [pending, start] = useTransition();
  const apply = (f: Failure) => {
    setFormError(f.message);
    Object.entries(f.fieldErrors ?? {}).forEach(([name, msgs]) => setError(name as Path<T>, { message: msgs[0] }));
  };
  return { formError, setFormError, pending, start, apply };
}
