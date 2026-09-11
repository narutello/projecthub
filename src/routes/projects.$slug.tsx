import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/locale-provider";
import { getProjectBySlugFn } from "@/lib/fns";
import { formatDate, localized } from "@/lib/utils";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => getProjectBySlugFn({ data: { slug: params.slug } }),
  component: ProjectPage,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const { locale, dir, t } = useLocale();
  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (!project) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-4 py-16">
          <h1 className="font-display text-4xl">{t.project.notFoundTitle}</h1>
          <p className="mt-3 text-muted-foreground">{t.project.notFoundBody}</p>
          <Button asChild className="mt-8">
            <Link to="/">
              <BackIcon className="size-4" />
              {t.project.back}
            </Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const name = localized(locale, project.nameEn, project.nameFa);
  const description = localized(locale, project.descriptionEn, project.descriptionFa);
  const gallery = [
    ...(project.coverImage
      ? [{ url: project.coverImage, captionEn: name, captionFa: name }]
      : []),
    ...project.screenshots.filter((shot) => shot.url !== project.coverImage),
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BackIcon className="size-4" />
          {t.project.back}
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl bg-muted">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt=""
              className="aspect-16/9 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-16/9 items-center justify-center font-display text-7xl text-muted-foreground">
              {name.slice(0, 1)}
            </div>
          )}
        </div>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <span className="text-sm text-muted-foreground">
                {t.category[project.category]}
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t.project.addedOn} {formatDate(project.createdAt, locale)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.liveUrl ? (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noreferrer">
                  {t.project.demo}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
            {project.githubUrl ? (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  <Github className="size-4" />
                  {t.project.github}
                </a>
              </Button>
            ) : null}
          </div>
        </header>

        <section className="mt-10 max-w-2xl">
          <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {t.project.about}
          </h2>
          <p className="mt-3 text-lg leading-relaxed">{description}</p>
        </section>

        {project.technologies.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.project.stack}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {gallery.length > 1 ? (
          <section className="mt-12">
            <h2 className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {t.project.screenshots}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {gallery.slice(1).map((shot) => (
                <figure key={shot.url} className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)]">
                  <img src={shot.url} alt="" className="aspect-16/10 w-full object-cover" />
                  {localized(locale, shot.captionEn, shot.captionFa) ? (
                    <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                      {localized(locale, shot.captionEn, shot.captionFa)}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
