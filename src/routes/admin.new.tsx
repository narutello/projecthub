import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";
import { LoginForm } from "@/components/admin/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAdminSessionFn } from "@/lib/fns";

export const Route = createFileRoute("/admin/new")({
  loader: async () => {
    const session = await getAdminSessionFn();
    return { session };
  },
  component: AdminNewPage,
});

function AdminNewPage() {
  const { session } = Route.useLoaderData();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader admin />
      <main className="flex-1">
        {session ? (
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
            <ProjectForm />
          </div>
        ) : (
          <LoginForm />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
