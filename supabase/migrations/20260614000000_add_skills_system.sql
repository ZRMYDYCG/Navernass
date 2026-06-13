-- Skills marketplace catalog + user installs + custom skills

CREATE TABLE IF NOT EXISTS public.skill_catalog (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'writing-style',
  license_type text NOT NULL DEFAULT 'official' CHECK (license_type IN ('official', 'community')),
  skill_md text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  npm_package text,
  is_builtin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_skill_installs (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES public.skill_catalog(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  installed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.user_custom_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  skill_md text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_custom_skills_name_format CHECK (name ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_user_skill_installs_user ON public.user_skill_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_skills_user ON public.user_custom_skills(user_id);

ALTER TABLE public.skill_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS skill_catalog_read ON public.skill_catalog;
CREATE POLICY skill_catalog_read ON public.skill_catalog
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS user_skill_installs_own ON public.user_skill_installs;
CREATE POLICY user_skill_installs_own ON public.user_skill_installs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_custom_skills_own ON public.user_custom_skills;
CREATE POLICY user_custom_skills_own ON public.user_custom_skills
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.skill_catalog IS 'Marketplace skill registry (official + community)';
COMMENT ON TABLE public.user_skill_installs IS 'User-enabled catalog skills';
COMMENT ON TABLE public.user_custom_skills IS 'User-authored SKILL.md content';
