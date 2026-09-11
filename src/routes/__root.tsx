import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getUiPrefsFn } from "@/lib/fns";
import { dirFor } from "@/lib/i18n";
import appCss from "../styles.css?url";

const APP_NAME = "Project Hub";

const bootScript = `(function(){try{var t=localStorage.getItem('ph-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var l=localStorage.getItem('ph-locale')||'en';var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.lang=l;d.dir=l==='fa'?'rtl':'ltr'}catch(e){}})();`;

export const Route = createRootRoute({
  loader: () => getUiPrefsFn(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "A living archive of projects — built, shipped, and kept in one place.",
      },
      { name: "theme-color", content: "#0b0c0e" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Vazirmatn:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  const prefs = Route.useLoaderData();
  const dir = dirFor(prefs.locale);

  return (
    <html
      lang={prefs.locale}
      dir={dir}
      className={prefs.theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <PreviewHostBridge />
        <AuthProvider>
          <LocaleProvider initialLocale={prefs.locale}>
            <ThemeProvider initialTheme={prefs.theme}>
              <Outlet />
              <Toaster position="top-center" />
            </ThemeProvider>
          </LocaleProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
