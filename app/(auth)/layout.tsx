import { Logo } from "@/components/patterns/logo";
import { ThemeToggle } from "@/components/patterns/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between px-5">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="contenu" className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">{children}</main>
    </div>
  );
}
