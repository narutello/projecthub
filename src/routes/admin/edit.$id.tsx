import { createFileRoute, Link } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";
import { LoginForm } from "@/components/admin/login-form";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { getAdminSessionFn, getProjectByIdFn } from "@/lib/fns";

export const Route = createFileRoute("/admin/edit/$id")({
  loader: async ({ params }) => {
    const session = await getAdminSessionFn();
    if (!session) {
      return { session: null as null, project: null as null };
    }
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return { session, project: null as null };
    }
    try {
      const project = await getProjectByIdFn({ data: { id } });
      return { session, project };
    } catch {
      return { session, project: null as null };
    }
  },
  component: AdminEditPage,
});

function AdminEditPage() {
  const { session, project } = Route.useLoaderData();
  const { t } = useLocale();

  if (!session) {
    return <LoginForm />;
  }

  if (!project) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start justify-center px-4 py-16">
        <h1 className="font-display text-4xl">{t.project.notFoundTitle}</h1>
        <p className="mt-3 text-muted-foreground">{t.project.notFoundBody}</p>
        <Button asChild className="mt-8">
          <Link to="/admin">{t.admin.dashboard}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <ProjectForm project={project} />
    </div>
  );
}
