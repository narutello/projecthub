import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/locale-provider";
import type { Project } from "@/lib/projects";
import { formatDate, localized } from "@/lib/utils";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const { locale, t } = useLocale();
  const name = localized(locale, project.nameEn, project.nameFa);
  const description = localized(locale, project.descriptionEn, project.descriptionFa);
  const delay = Math.min(index, 4);

  return (
    <article
      className={`reveal reveal-delay-${delay} group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[var(--shadow-border-hover)]`}
    >
      <Link to="/projects/$slug" params={{ slug: project.slug }} className="block">
        <div className="relative aspect-16/10 overflow-hidden bg-muted">
          {project.coverImage ? (
            <img
              src={project.coverImage}
              alt=""
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-5xl text-muted-foreground">
              {name.slice(0, 1)}
            </div>
          )}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <StatusBadge status={project.status} />
            {project.featured ? (
              <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-xs text-foreground backdrop-blur-sm">
                {t.home.featured}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {t.category[project.category]}
            </p>
            <h2 className="mt-1 font-display text-2xl leading-snug">
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="text-foreground no-underline"
              >
                {name}
              </Link>
            </h2>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 ? (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
              +{project.technologies.length - 3}
            </span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            {t.home.added} {formatDate(project.createdAt, locale)}
          </span>
          <div className="flex items-center gap-2">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
                aria-label={t.project.github}
              >
                <Github className="size-4" />
              </a>
            ) : null}
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex size-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
                aria-label={t.project.demo}
              >
                <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
