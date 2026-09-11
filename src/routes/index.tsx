import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ProjectCard } from "@/components/project-card";
import { ProjectFilters, type FilterState } from "@/components/project-filters";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useLocale } from "@/components/locale-provider";
import { listProjectsFn } from "@/lib/fns";
import { localized } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => listProjectsFn(),
  component: Home,
});

function Home() {
  const projects = Route.useLoaderData();
  const { locale, t } = useLocale();
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    category: "all",
    status: "all",
  });

  const visible = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return projects.filter((project) => {
      if (filters.category !== "all" && project.category !== filters.category) return false;
      if (filters.status !== "all" && project.status !== filters.status) return false;
      if (!q) return true;
      const hay = [
        localized(locale, project.nameEn, project.nameFa),
        localized(locale, project.descriptionEn, project.descriptionFa),
        project.slug,
        ...project.technologies,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, filters, locale]);

  const countLabel =
    visible.length === 1 ? t.home.countOne : t.home.count.replace("{n}", String(visible.length));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <section className="max-w-3xl">
          <p className="reveal text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t.home.kicker}
          </p>
          <h1 className="reveal reveal-delay-1 mt-4 font-display text-4xl leading-[1.1] sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="reveal reveal-delay-2 mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.home.subtitle}
          </p>
        </section>

        <section className="reveal reveal-delay-3 mt-10">
          <ProjectFilters value={filters} onChange={setFilters} />
          <p className="mt-4 text-sm text-muted-foreground">{countLabel}</p>
        </section>

        {visible.length === 0 ? (
          <div className="mt-16 rounded-2xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl">{t.home.emptyTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.home.emptyBody}</p>
          </div>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
