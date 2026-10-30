"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fromPostgrest, failure } from "@/lib/supabase/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { run } from "@/lib/actions";
import { ok, type Result } from "@/lib/result";
import type { Casquette } from "./types";

/** Bascule de casquette (profiles.active_casquette : seule colonne « rôle » modifiable par l'utilisateur). */
export async function switchCasquette(next: Casquette): Promise<Result<void>> {
  return run("profiles.switch", async () => {
    if (!z.enum(["freelance", "porteur"]).safeParse(next).success) return failure("VALIDATION");
    const user = await getCurrentUser();
    if (!user) return failure("UNAUTHENTICATED");
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ active_casquette: next }).eq("id", user.id);
    if (error) return fromPostgrest(error);
    revalidatePath("/", "layout");
    return ok(undefined);
  });
}
