import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CATEGORIES, STATUSES } from "./utils";
import type { Project, ProjectInput, Screenshot } from "./projects";

const screenshotSchema = z.object({
  url: z.string().min(1),
  captionEn: z.string().optional().default(""),
  captionFa: z.string().optional().default(""),
});

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value) || value.startsWith("/"), {
    message: "url",
  });

const imageValue = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("data:image/") ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    { message: "image" },
  );

const projectInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug"),
  nameEn: z.string().trim().min(1, "nameEn"),
  nameFa: z.string().trim().default(""),
  descriptionEn: z.string().trim().min(1, "descriptionEn"),
  descriptionFa: z.string().trim().default(""),
  category: z.enum(CATEGORIES),
  status: z.enum(STATUSES),
  technologies: z.array(z.string().trim().min(1)).default([]),
  liveUrl: optionalUrl.default(""),
  githubUrl: optionalUrl.default(""),
  coverImage: imageValue.default(""),
  screenshots: z.array(screenshotSchema).default([]),
  featured: z.boolean().default(false),
});

function toInput(data: z.infer<typeof projectInputSchema>): ProjectInput {
  const screenshots: Screenshot[] = data.screenshots.map((shot) => ({
    url: shot.url,
    captionEn: shot.captionEn ?? "",
    captionFa: shot.captionFa ?? "",
  }));
  return {
    slug: data.slug,
    nameEn: data.nameEn,
    nameFa: data.nameFa ?? "",
    descriptionEn: data.descriptionEn,
    descriptionFa: data.descriptionFa ?? "",
    category: data.category,
    status: data.status,
    technologies: data.technologies,
    liveUrl: data.liveUrl ?? "",
    githubUrl: data.githubUrl ?? "",
    coverImage: data.coverImage ?? "",
    screenshots,
    featured: data.featured,
  };
}

export const getUiPrefsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { isLocale } = await import("./i18n");
  const localeRaw = getCookie("ph_locale");
  const themeRaw = getCookie("ph_theme");
  return {
    locale: isLocale(localeRaw) ? localeRaw : "en",
    theme: themeRaw === "light" || themeRaw === "dark" ? themeRaw : "dark",
  };
});

export const listProjectsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { listProjectsFromDb } = await import("./projects.server");
  return listProjectsFromDb();
});

export const getProjectBySlugFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { getProjectBySlugFromDb } = await import("./projects.server");
    return getProjectBySlugFromDb(data.slug);
  });

export const getAdminSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminSession } = await import("./admin-auth.server");
  return getAdminSession();
});

export const getLoginMetaFn = createServerFn({ method: "GET" }).handler(async () => {
  const { loginMeta } = await import("./admin-auth.server");
  return loginMeta();
});

export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ email: z.string().min(1), password: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { loginAdmin } = await import("./admin-auth.server");
    return loginAdmin(data.email, data.password);
  });

export const adminLogoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutAdmin } = await import("./admin-auth.server");
  logoutAdmin();
  return { ok: true as const };
});

export const adminStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("./admin-auth.server");
  const { statsFromDb } = await import("./projects.server");
  await requireAdmin();
  return statsFromDb();
});

export const createProjectFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => projectInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { createProjectInDb, slugTaken } = await import("./projects.server");
    await requireAdmin();
    if (await slugTaken(data.slug)) {
      throw new Error("SLUG_TAKEN");
    }
    return createProjectInDb(toInput(data));
  });

export const updateProjectFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    projectInputSchema.extend({ id: z.number().int().positive() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { updateProjectInDb, slugTaken } = await import("./projects.server");
    await requireAdmin();
    if (await slugTaken(data.slug, data.id)) {
      throw new Error("SLUG_TAKEN");
    }
    const { id, ...rest } = data;
    return updateProjectInDb(id, toInput(rest));
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { deleteProjectFromDb } = await import("./projects.server");
    await requireAdmin();
    await deleteProjectFromDb(data.id);
    return { ok: true as const };
  });

export const updateStatusFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: z.number().int().positive(), status: z.enum(STATUSES) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { updateProjectStatusInDb } = await import("./projects.server");
    await requireAdmin();
    return updateProjectStatusInDb(data.id, data.status);
  });

export const moveProjectFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        id: z.number().int().positive(),
        direction: z.enum(["up", "down"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { moveProjectInDb } = await import("./projects.server");
    await requireAdmin();
    return moveProjectInDb(data.id, data.direction);
  });

export const getProjectByIdFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ id: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("./admin-auth.server");
    const { getProjectByIdFromDb } = await import("./projects.server");
    await requireAdmin();
    return getProjectByIdFromDb(data.id);
  });

export type { Project };
