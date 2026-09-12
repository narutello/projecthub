import { useMemo, useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { useLocale } from "@/components/locale-provider";
import {
  deleteProjectFn,
  moveProjectFn,
  updateStatusFn,
} from "@/lib/fns";
import type { Project } from "@/lib/projects";
import { STATUSES, localized } from "@/lib/utils";

export function AdminDashboard({
  projects,
  stats,
}: {
  projects: Project[];
  stats: { total: number; live: number; in_progress: number; archived: number };
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) => {
      const hay = [
        project.nameEn,
        project.nameFa,
        project.slug,
        project.category,
        project.status,
        ...project.technologies,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, query]);

  async function refresh() {
    await router.invalidate();
  }

  async function onDelete() {
    if (pendingId == null) return;
    try {
      await deleteProjectFn({ data: { id: pendingId } });
      toast.success(t.admin.deleted);
      setPendingId(null);
      await refresh();
    } catch {
      toast.error(t.common.error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{t.admin.dashboard}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.admin.emptyBody}</p>
        </div>
        <Button type="button" onClick={() => navigate({ to: "/admin/new" })}>
          <Plus className="size-4" />
          {t.admin.addProject}
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t.admin.statsTotal} value={stats.total} />
        <Stat label={t.admin.statsLive} value={stats.live} />
        <Stat label={t.admin.statsProgress} value={stats.in_progress} />
        <Stat label={t.admin.statsArchived} value={stats.archived} />
      </div>

      <div className="mt-8">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.admin.searchPlaceholder}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
          <h2 className="font-display text-2xl">{t.admin.emptyTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.admin.emptyBody}</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {filtered.map((project, index) => {
            const name = localized(locale, project.nameEn, project.nameFa);
            return (
              <li
                key={project.id}
                className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center font-display text-xl">
                      {name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{name}</p>
                    <StatusBadge status={project.status} />
                    {project.featured ? (
                      <span className="text-xs text-muted-foreground">{t.admin.featured}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    /projects/{project.slug} · {t.category[project.category]}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={project.status}
                    onValueChange={async (status) => {
                      try {
                        await updateStatusFn({
                          data: { id: project.id, status: status as Project["status"] },
                        });
                        toast.success(t.admin.statusChanged);
                        await refresh();
                      } catch {
                        toast.error(t.common.error);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 w-[9.5rem]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t.status[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t.admin.moveUp}
                    disabled={index === 0}
                    onClick={async () => {
                      await moveProjectFn({ data: { id: project.id, direction: "up" } });
                      toast.success(t.admin.reordered);
                      await refresh();
                    }}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t.admin.moveDown}
                    disabled={index === filtered.length - 1}
                    onClick={async () => {
                      await moveProjectFn({ data: { id: project.id, direction: "down" } });
                      toast.success(t.admin.reordered);
                      await refresh();
                    }}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t.common.edit}
                    onClick={() =>
                      navigate({ to: "/admin/edit/$id", params: { id: String(project.id) } })
                    }
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t.common.delete}
                    onClick={() => setPendingId(project.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={pendingId != null} onOpenChange={() => setPendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.admin.deleteBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-5 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}
