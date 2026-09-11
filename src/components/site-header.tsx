import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocale } from "@/components/locale-provider";

export function SiteHeader({ admin = false }: { admin?: boolean }) {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className="hidden h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {t.nav.projects}
          </Link>
          <Link
            to="/admin"
            className="inline-flex h-11 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {admin ? t.admin.dashboard : t.nav.admin}
          </Link>
          <LanguageSwitcher className="ms-1" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
