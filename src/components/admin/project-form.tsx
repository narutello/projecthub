import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/locale-provider";
import { createProjectFn, updateProjectFn } from "@/lib/fns";
import type { Project, Screenshot } from "@/lib/projects";
import {
  CATEGORIES,
  STATUSES,
  compressImage,
  slugify,
  type Category,
  type ProjectStatus,
} from "@/lib/utils";

type FormState = {
  nameEn: string;
  nameFa: string;
  slug: string;
  descriptionEn: string;
  descriptionFa: string;
  category: Category;
  status: ProjectStatus;
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  coverImage: string;
  screenshots: Screenshot[];
  featured: boolean;
};

function fromProject(project?: Project | null): FormState {
  return {
    nameEn: project?.nameEn ?? "",
    nameFa: project?.nameFa ?? "",
    slug: project?.slug ?? "",
    descriptionEn: project?.descriptionEn ?? "",
    descriptionFa: project?.descriptionFa ?? "",
    category: project?.category ?? "web",
    status: project?.status ?? "in_progress",
    technologies: project?.technologies ?? [],
    liveUrl: project?.liveUrl ?? "",
    githubUrl: project?.githubUrl ?? "",
    coverImage: project?.coverImage ?? "",
    screenshots: project?.screenshots ?? [],
    featured: project?.featured ?? false,
  };
}

export function ProjectForm({ project }: { project?: Project | null }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(() => fromProject(project));
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [techDraft, setTechDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const title = project ? t.admin.editProject : t.admin.addProject;

  const fieldError = useMemo(
    () => ({
      nameEn: t.form.errors.nameEn,
      slug: t.form.errors.slug,
      descriptionEn: t.form.errors.descriptionEn,
    }),
    [t],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onCoverFile(file: File | undefined) {
    if (!file) return;
    const dataUrl = await compressImage(file);
    update("coverImage", dataUrl);
  }

  async function onShotFile(index: number, file: File | undefined) {
    if (!file) return;
    const dataUrl = await compressImage(file);
    update(
      "screenshots",
      form.screenshots.map((shot, i) => (i === index ? { ...shot, url: dataUrl } : shot)),
    );
  }

  function addTech() {
    const value = techDraft.trim();
    if (!value) return;
    if (!form.technologies.includes(value)) {
      update("technologies", [...form.technologies, value]);
    }
    setTechDraft("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.nameEn.trim()) nextErrors.nameEn = fieldError.nameEn;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) nextErrors.slug = fieldError.slug;
    if (!form.descriptionEn.trim()) nextErrors.descriptionEn = fieldError.descriptionEn;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error(t.form.errors.generic);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        nameEn: form.nameEn.trim(),
        slug: form.slug.trim(),
        descriptionEn: form.descriptionEn.trim(),
        screenshots: form.screenshots.filter((shot) => shot.url.trim()),
      };
      if (project) {
        await updateProjectFn({ data: { id: project.id, ...payload } });
        toast.success(t.admin.saved);
      } else {
        await createProjectFn({ data: payload });
        toast.success(t.admin.created);
      }
      await navigate({ to: "/admin" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("SLUG_TAKEN")) {
        setErrors({ slug: t.form.errors.slugTaken });
        toast.error(t.form.errors.slugTaken);
      } else if (message.includes("UNAUTHORIZED")) {
        toast.error(t.admin.invalid);
        await navigate({ to: "/admin" });
      } else {
        toast.error(t.common.error);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.admin.fallbackHint}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label={t.form.nameEn} error={errors.nameEn}>
          <Input
            value={form.nameEn}
            onChange={(event) => {
              const nameEn = event.target.value;
              update("nameEn", nameEn);
              if (!slugTouched) update("slug", slugify(nameEn));
            }}
          />
        </Field>
        <Field label={t.form.nameFa}>
          <Input
            value={form.nameFa}
            onChange={(event) => update("nameFa", event.target.value)}
            dir="rtl"
          />
        </Field>
        <Field label={t.form.slug} hint={t.admin.slugHint} error={errors.slug} className="sm:col-span-2">
          <Input
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              update("slug", event.target.value.toLowerCase());
            }}
          />
        </Field>
        <Field label={t.form.descriptionEn} error={errors.descriptionEn} className="sm:col-span-2">
          <Textarea
            value={form.descriptionEn}
            onChange={(event) => update("descriptionEn", event.target.value)}
            rows={4}
          />
        </Field>
        <Field label={t.form.descriptionFa} className="sm:col-span-2">
          <Textarea
            value={form.descriptionFa}
            onChange={(event) => update("descriptionFa", event.target.value)}
            rows={4}
            dir="rtl"
          />
        </Field>
        <Field label={t.form.category}>
          <Select
            value={form.category}
            onValueChange={(value) => update("category", value as Category)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {t.category[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.form.status}>
          <Select
            value={form.status}
            onValueChange={(value) => update("status", value as ProjectStatus)}
          >
            <SelectTrigger>
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
        </Field>
        <Field label={t.form.liveUrl}>
          <Input
            value={form.liveUrl}
            onChange={(event) => update("liveUrl", event.target.value)}
            inputMode="url"
            placeholder="https://"
          />
        </Field>
        <Field label={t.form.githubUrl}>
          <Input
            value={form.githubUrl}
            onChange={(event) => update("githubUrl", event.target.value)}
            inputMode="url"
            placeholder="https://github.com/"
          />
        </Field>
      </section>

      <section className="grid gap-3">
        <Label>{t.form.technologies}</Label>
        <p className="text-xs text-muted-foreground">{t.admin.techHint}</p>
        <div className="flex flex-wrap gap-2">
          {form.technologies.map((tech) => (
            <button
              key={tech}
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-full bg-secondary px-3 text-sm"
              onClick={() =>
                update(
                  "technologies",
                  form.technologies.filter((item) => item !== tech),
                )
              }
            >
              {tech}
              <X className="size-3.5" />
            </button>
          ))}
        </div>
        <Input
          value={techDraft}
          onChange={(event) => setTechDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTech();
            }
          }}
          placeholder={t.form.technologies}
        />
      </section>

      <section className="grid gap-3">
        <Label>{t.form.coverImage}</Label>
        <p className="text-xs text-muted-foreground">{t.admin.coverHint}</p>
        {form.coverImage ? (
          <img
            src={form.coverImage}
            alt=""
            className="aspect-16/9 w-full rounded-xl object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm">
            <Upload className="size-4" />
            {t.form.upload}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => onCoverFile(event.target.files?.[0])}
            />
          </label>
          <Input
            value={form.coverImage.startsWith("data:") ? "" : form.coverImage}
            onChange={(event) => update("coverImage", event.target.value)}
            placeholder={t.form.orUrl}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>{t.admin.extraScreens}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update("screenshots", [
                ...form.screenshots,
                { url: "", captionEn: "", captionFa: "" },
              ])
            }
          >
            <Plus className="size-4" />
            {t.admin.addScreenshot}
          </Button>
        </div>
        <div className="grid gap-4">
          {form.screenshots.map((shot, index) => (
            <div key={index} className="rounded-xl bg-muted/50 p-4">
              {shot.url ? (
                <img src={shot.url} alt="" className="mb-3 aspect-16/9 w-full rounded-lg object-cover" />
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={shot.url.startsWith("data:") ? "" : shot.url}
                  onChange={(event) =>
                    update(
                      "screenshots",
                      form.screenshots.map((item, i) =>
                        i === index ? { ...item, url: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder={t.form.orUrl}
                />
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm">
                  <Upload className="size-4" />
                  {t.form.upload}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => onShotFile(index, event.target.files?.[0])}
                  />
                </label>
                <Input
                  value={shot.captionEn}
                  onChange={(event) =>
                    update(
                      "screenshots",
                      form.screenshots.map((item, i) =>
                        i === index ? { ...item, captionEn: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder={t.form.captionEn}
                />
                <Input
                  value={shot.captionFa}
                  dir="rtl"
                  onChange={(event) =>
                    update(
                      "screenshots",
                      form.screenshots.map((item, i) =>
                        i === index ? { ...item, captionFa: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder={t.form.captionFa}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  update(
                    "screenshots",
                    form.screenshots.filter((_, i) => i !== index),
                  )
                }
              >
                {t.admin.removeScreenshot}
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3">
        <Label htmlFor="featured">{t.form.featured}</Label>
        <Switch
          id="featured"
          checked={form.featured}
          onCheckedChange={(checked) => update("featured", checked)}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin" })}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t.common.saving : t.common.save}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
