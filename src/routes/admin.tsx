import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/dashboard";
import { LoginForm } from "@/components/admin/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import {
  adminLogoutFn,
  adminStatsFn,
  getAdminSessionFn,
  getLoginMetaFn,
  listProjectsFn,
} from "@/lib/fns";

export const Route = createFileRoute("/admin")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session) {
      const meta = await getLoginMetaFn();
      return {
        session: null as null,
        meta,
        projects: null as null,
        stats: null as null,
      };
    }
    const [projects, stats] = await Promise.all([listProjectsFn(), adminStatsFn()]);
    return {
      session,
      meta: null as null,
      projects,
      stats,
    };
  },
  component: AdminPage,
});

function AdminPage() {
  const data = Route.useLoaderData();
  const { t } = useLocale();
  const router = useRouter();

  async function onLogout() {
    await adminLogoutFn();
    await router.invalidate();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader admin />
      <main className="flex-1">
        {data.session && data.projects && data.stats ? (
          <>
            <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-6">
              <Button type="button" variant="outline" size="sm" onClick={onLogout}>
                {t.admin.logout}
              </Button>
            </div>
            <AdminDashboard projects={data.projects} stats={data.stats} />
          </>
        ) : (
          <LoginForm preview={Boolean(data.meta?.preview)} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
