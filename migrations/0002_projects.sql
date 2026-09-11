create table if not exists projects (
  id serial primary key,
  slug text not null unique,
  name_en text not null,
  name_fa text not null default '',
  description_en text not null,
  description_fa text not null default '',
  category text not null default 'web',
  status text not null default 'in_progress'
    check (status in ('live', 'in_progress', 'archived')),
  technologies jsonb not null default '[]'::jsonb,
  live_url text,
  github_url text,
  cover_image text,
  screenshots jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_public_idx
  on projects (featured desc, sort_order asc, created_at desc);
create index if not exists projects_category_idx on projects (category);
create index if not exists projects_status_idx on projects (status);

insert into projects (
  slug, name_en, name_fa, description_en, description_fa, category, status,
  technologies, live_url, github_url, cover_image, screenshots, featured, sort_order, created_at
) values
(
  'arzhub',
  'ArzHub',
  'ارزهاب',
  'A live currency and gold-price hub with clean charts, historical views, and fast updates for everyday decisions.',
  'هابی برای نرخ ارز و طلا با نمودارهای خوانا، تاریخچه قیمت و به‌روزرسانی سریع برای تصمیم‌های روزمره.',
  'web',
  'live',
  '["TypeScript","React","Postgres","Charts"]'::jsonb,
  'https://arzhub.example',
  'https://github.com/example/arzhub',
  '/covers/arzhub.jpg',
  '[{"url":"/covers/arzhub-ui.jpg","captionEn":"Rates overview","captionFa":"نمای کلی نرخ‌ها"}]'::jsonb,
  true,
  10,
  now() - interval '48 days'
),
(
  'lumen-docs',
  'Lumen Docs',
  'لومن داکس',
  'A documentation system that turns structured notes into a calm, searchable knowledge base.',
  'سامانه‌ای برای مستندات که یادداشت‌های ساخت‌یافته را به دانش‌نامه‌ای آرام و قابل جستجو تبدیل می‌کند.',
  'web',
  'live',
  '["React","MDX","Tailwind"]'::jsonb,
  'https://lumen.example',
  'https://github.com/example/lumen-docs',
  '/covers/lumen-docs.jpg',
  '[{"url":"/covers/lumen-ui.jpg","captionEn":"Article layout","captionFa":"چیدمان مقاله"}]'::jsonb,
  false,
  20,
  now() - interval '36 days'
),
(
  'nimbus-tasks',
  'Nimbus Tasks',
  'نیمبوس تسک',
  'A focused board for shipping work — columns, owners, and just enough status to stay honest.',
  'بوردی متمرکز برای پیش‌برد کار — ستون‌ها، مسئول‌ها، و به اندازهٔ کافی وضعیت برای صادق ماندن.',
  'web',
  'in_progress',
  '["TypeScript","TanStack","Postgres"]'::jsonb,
  null,
  'https://github.com/example/nimbus-tasks',
  '/covers/nimbus-tasks.jpg',
  '[]'::jsonb,
  false,
  30,
  now() - interval '21 days'
),
(
  'forge-cli',
  'Forge CLI',
  'فورج سی‌ال‌آی',
  'A command-line toolkit for scaffolding, checking, and shipping small internal tools without ceremony.',
  'ابزار خط فرمان برای ساخت، بررسی و انتشار ابزارهای داخلی کوچک، بدون تشریفات اضافه.',
  'cli',
  'live',
  '["Node.js","TypeScript","CLI"]'::jsonb,
  null,
  'https://github.com/example/forge-cli',
  '/covers/forge-cli.jpg',
  '[]'::jsonb,
  false,
  40,
  now() - interval '14 days'
),
(
  'kepler-maps',
  'Kepler Maps',
  'کپلر مپس',
  'A geospatial visualization kit for layering quiet, readable maps over dense datasets.',
  'کیت تصویرسازی مکانی برای نشاندن نقشه‌هایی خوانا و آرام روی داده‌های فشرده.',
  'library',
  'archived',
  '["WebGL","TypeScript","GeoJSON"]'::jsonb,
  null,
  'https://github.com/example/kepler-maps',
  '/covers/kepler-maps.jpg',
  '[]'::jsonb,
  false,
  50,
  now() - interval '90 days'
),
(
  'signal-desk',
  'Signal Desk',
  'سیگنال دسک',
  'A real-time operations desk: sparse charts, incident lists, and status that can be read at a glance.',
  'میز عملیات زنده: نمودارهای خلوت، فهرست رخدادها، و وضعیتی که با یک نگاه خوانده می‌شود.',
  'web',
  'in_progress',
  '["React","WebSockets","Postgres"]'::jsonb,
  'https://signal.example',
  'https://github.com/example/signal-desk',
  '/covers/signal-desk.jpg',
  '[{"url":"/covers/signal-ui.jpg","captionEn":"Live charts","captionFa":"نمودارهای زنده"}]'::jsonb,
  true,
  15,
  now() - interval '8 days'
)
on conflict (slug) do nothing;
