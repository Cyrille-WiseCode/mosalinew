"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { m } from "@/lib/messages";

export function ThemeToggle({ variant = "ghost" }: { variant?: "ghost" | "light" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <Button variant={variant} size="icon" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={m.common.toggleTheme} title={dark ? m.common.themeLight : m.common.themeDark}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
