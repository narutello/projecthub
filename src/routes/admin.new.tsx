import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProjectForm } from "@/components/admin/project-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAdminSessionFn } from "@/lib/fns";

export const Route = createFileRoute("/admin/new")({
  loader: async () => {
    const session = await getAdminSessionFn();
    if (!session) {
      throw redirect({ to: "/admin" });
    }
    return { session };
  },
  component: AdminNewPage,
});

function AdminNewPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader admin />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <ProjectForm />
      </main>
      <SiteFooter />
    </div>
  );
}
