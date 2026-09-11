import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-full bg-secondary p-1 text-xs font-medium",
        className,
      )}
      role="group"
      aria-label={t.nav.language}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "h-9 min-w-11 rounded-full px-3 transition-colors duration-150",
          locale === "en"
            ? "bg-card text-foreground shadow-[var(--shadow-border)]"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "en"}
      >
        {t.nav.english}
      </button>
      <button
        type="button"
        onClick={() => setLocale("fa")}
        className={cn(
          "h-9 min-w-11 rounded-full px-3 transition-colors duration-150",
          locale === "fa"
            ? "bg-card text-foreground shadow-[var(--shadow-border)]"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-pressed={locale === "fa"}
      >
        {t.nav.persian}
      </button>
    </div>
  );
}
