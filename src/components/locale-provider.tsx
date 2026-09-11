import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  dirFor,
  messagesFor,
  LOCALE_COOKIE,
  type Locale,
  type Messages,
} from "@/lib/i18n";

function persistLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = dirFor(locale);
  localStorage.setItem("ph-locale", locale);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

type LocaleContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: dirFor(locale),
      t: messagesFor(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
