import type { Category, ProjectStatus } from "./utils";

export type Screenshot = {
  url: string;
  captionEn: string;
  captionFa: string;
};

export type Project = {
  id: number;
  slug: string;
  nameEn: string;
  nameFa: string;
  descriptionEn: string;
  descriptionFa: string;
  category: Category;
  status: ProjectStatus;
  technologies: string[];
  liveUrl: string | null;
  githubUrl: string | null;
  coverImage: string | null;
  screenshots: Screenshot[];
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  slug: string;
  nameEn: string;
  nameFa: string;
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
  sortOrder?: number;
};

export type PublicFilters = {
  q?: string;
  category?: string;
  status?: string;
};
