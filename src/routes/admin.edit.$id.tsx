import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { getAdminSessionFn, getProjectByIdFn } from "@/lib/fns";

export const Route = createFileRoute("/admin/edit/$id")({
  loader: async ({ params }) => {
    const session = await getAdminSessionFn();
    if (!session) {
      throw redirect({ to: "/admin" });
    }
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return { project: null as null };
    }
    try {
      const project = await getProjectByIdFn({ data: { id } });
      return { project };
    } catch {
      return { project: null as null };
    }
  },
  component: AdminEditPage,
});

function AdminEditPage() {
  const { project } = Route.useLoaderData();
  const { t } = useLocale();

  if (!project) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader admin />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-4 py-16">
          <h1 className="font-display text-4xl">{t.project.notFoundTitle}</h1>
          <p className="mt-3 text-muted-foreground">{t.project.notFoundBody}</p>
          <Button asChild className="mt-8">
            <Link to="/admin">{t.admin.dashboard}</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader admin />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <ProjectForm project={project} />
      </main>
      <SiteFooter />
    </div>
  );
}
