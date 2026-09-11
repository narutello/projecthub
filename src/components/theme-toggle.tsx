import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/components/locale-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? t.nav.light : t.nav.dark}
    >
      <span className="relative size-4">
        <Sun
          className={cnIcon(
            "absolute inset-0",
            isDark ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]",
          )}
        />
        <Moon
          className={cnIcon(
            "absolute inset-0",
            isDark ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
          )}
        />
      </span>
    </Button>
  );
}

function cnIcon(...classes: string[]) {
  return [
    "transition-[opacity,filter,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
    ...classes,
  ].join(" ");
}
