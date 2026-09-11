import { getSql } from "./db";
import type { Project, ProjectInput, Screenshot } from "./projects";
import { isCategory, isStatus, type Category, type ProjectStatus } from "./utils";

type ProjectRow = {
  id: number;
  slug: string;
  name_en: string;
  name_fa: string;
  description_en: string;
  description_fa: string;
  category: string;
  status: string;
  technologies: unknown;
  live_url: string | null;
  github_url: string | null;
  cover_image: string | null;
  screenshots: unknown;
  featured: boolean;
  sort_order: number;
  created_at: string | Date;
  updated_at: string | Date;
};

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return asStringArray(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

function asScreenshots(value: unknown): Screenshot[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            return [];
          }
        })()
      : [];
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const rec = item as Record<string, unknown>;
      if (typeof rec.url !== "string" || !rec.url) return null;
      return {
        url: rec.url,
        captionEn: typeof rec.captionEn === "string" ? rec.captionEn : "",
        captionFa: typeof rec.captionFa === "string" ? rec.captionFa : "",
      };
    })
    .filter((item): item is Screenshot => item !== null);
}

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function mapProject(row: ProjectRow): Project {
  const category = isCategory(row.category) ? row.category : "other";
  const status = isStatus(row.status) ? row.status : "in_progress";
  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameFa: row.name_fa ?? "",
    descriptionEn: row.description_en,
    descriptionFa: row.description_fa ?? "",
    category,
    status,
    technologies: asStringArray(row.technologies),
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    coverImage: row.cover_image,
    screenshots: asScreenshots(row.screenshots),
    featured: Boolean(row.featured),
    sortOrder: row.sort_order,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

const SELECT = `
  id, slug, name_en, name_fa, description_en, description_fa, category, status,
  technologies, live_url, github_url, cover_image, screenshots, featured,
  sort_order, created_at, updated_at
`;

export async function listProjectsFromDb(): Promise<Project[]> {
  const sql = await getSql();
  const rows = await sql.query<ProjectRow>(
    `select ${SELECT} from projects order by featured desc, sort_order asc, created_at desc`,
  );
  return rows.map(mapProject);
}

export async function getProjectBySlugFromDb(slug: string): Promise<Project | null> {
  const sql = await getSql();
  const rows = await sql.query<ProjectRow>(
    `select ${SELECT} from projects where slug = $1 limit 1`,
    [slug],
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function getProjectByIdFromDb(id: number): Promise<Project | null> {
  const sql = await getSql();
  const rows = await sql.query<ProjectRow>(
    `select ${SELECT} from projects where id = $1 limit 1`,
    [id],
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function slugTaken(slug: string, exceptId?: number): Promise<boolean> {
  const sql = await getSql();
  const rows = exceptId
    ? await sql.query<{ id: number }>(
        `select id from projects where slug = $1 and id <> $2 limit 1`,
        [slug, exceptId],
      )
    : await sql.query<{ id: number }>(`select id from projects where slug = $1 limit 1`, [slug]);
  return rows.length > 0;
}

function nextSortOrder(currentMax: number | null): number {
  return (currentMax ?? 0) + 10;
}

export async function createProjectInDb(input: ProjectInput): Promise<Project> {
  const sql = await getSql();
  const maxRows = await sql.query<{ max: number | null }>(
    `select max(sort_order) as max from projects`,
  );
  const sortOrder = input.sortOrder ?? nextSortOrder(maxRows[0]?.max ?? 0);
  const rows = await sql.query<ProjectRow>(
    `insert into projects (
      slug, name_en, name_fa, description_en, description_fa, category, status,
      technologies, live_url, github_url, cover_image, screenshots, featured, sort_order
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11,$12::jsonb,$13,$14
    ) returning ${SELECT}`,
    [
      input.slug,
      input.nameEn,
      input.nameFa,
      input.descriptionEn,
      input.descriptionFa,
      input.category,
      input.status,
      JSON.stringify(input.technologies),
      input.liveUrl || null,
      input.githubUrl || null,
      input.coverImage || null,
      JSON.stringify(input.screenshots),
      input.featured,
      sortOrder,
    ],
  );
  return mapProject(rows[0]);
}

export async function updateProjectInDb(id: number, input: ProjectInput): Promise<Project> {
  const sql = await getSql();
  const rows = await sql.query<ProjectRow>(
    `update projects set
      slug = $2,
      name_en = $3,
      name_fa = $4,
      description_en = $5,
      description_fa = $6,
      category = $7,
      status = $8,
      technologies = $9::jsonb,
      live_url = $10,
      github_url = $11,
      cover_image = $12,
      screenshots = $13::jsonb,
      featured = $14,
      updated_at = now()
    where id = $1
    returning ${SELECT}`,
    [
      id,
      input.slug,
      input.nameEn,
      input.nameFa,
      input.descriptionEn,
      input.descriptionFa,
      input.category,
      input.status,
      JSON.stringify(input.technologies),
      input.liveUrl || null,
      input.githubUrl || null,
      input.coverImage || null,
      JSON.stringify(input.screenshots),
      input.featured,
    ],
  );
  if (!rows[0]) throw new Error("NOT_FOUND");
  return mapProject(rows[0]);
}

export async function deleteProjectFromDb(id: number): Promise<void> {
  const sql = await getSql();
  await sql.query(`delete from projects where id = $1`, [id]);
}

export async function updateProjectStatusInDb(
  id: number,
  status: ProjectStatus,
): Promise<Project> {
  const sql = await getSql();
  const rows = await sql.query<ProjectRow>(
    `update projects set status = $2, updated_at = now() where id = $1 returning ${SELECT}`,
    [id, status],
  );
  if (!rows[0]) throw new Error("NOT_FOUND");
  return mapProject(rows[0]);
}

export async function moveProjectInDb(
  id: number,
  direction: "up" | "down",
): Promise<Project[]> {
  const sql = await getSql();
  const all = await sql.query<ProjectRow>(
    `select ${SELECT} from projects order by sort_order asc, created_at desc`,
  );
  const index = all.findIndex((row) => row.id === id);
  if (index < 0) throw new Error("NOT_FOUND");
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= all.length) return all.map(mapProject);
  const a = all[index];
  const b = all[swapWith];
  await sql.query(`update projects set sort_order = $2, updated_at = now() where id = $1`, [
    a.id,
    b.sort_order,
  ]);
  await sql.query(`update projects set sort_order = $2, updated_at = now() where id = $1`, [
    b.id,
    a.sort_order,
  ]);
  return listProjectsFromDb();
}

export async function statsFromDb() {
  const sql = await getSql();
  const rows = await sql.query<{ status: string; count: number }>(
    `select status, count(*)::int as count from projects group by status`,
  );
  const counts: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    counts[row.status] = row.count;
    total += row.count;
  }
  return {
    total,
    live: counts.live ?? 0,
    in_progress: counts.in_progress ?? 0,
    archived: counts.archived ?? 0,
  };
}

export type { Category };
