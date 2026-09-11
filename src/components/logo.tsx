import { Link } from "@tanstack/react-router";
import { useLocale } from "@/components/locale-provider";

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 text-foreground no-underline"
      aria-label={t.brand.name}
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <circle cx="12" cy="4.5" r="1.4" fill="currentColor" />
          <circle cx="12" cy="19.5" r="1.4" fill="currentColor" />
          <circle cx="4.5" cy="12" r="1.4" fill="currentColor" />
          <circle cx="19.5" cy="12" r="1.4" fill="currentColor" />
          <path
            d="M12 6.4v3.2M12 14.4v3.2M6.4 12h3.2M14.4 12h3.2"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-lg leading-none tracking-tight">
          {t.brand.name}
        </span>
      )}
    </Link>
  );
}
