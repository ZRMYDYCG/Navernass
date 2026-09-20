-- Drop frontend Skills marketplace (Next.js) tables and seed helper.
-- Backend Nest SkillModule / Prisma skill_* tables are unaffected.

DROP FUNCTION IF EXISTS public.seed_builtin_skill_catalog();

DROP TABLE IF EXISTS public.user_custom_skills;
DROP TABLE IF EXISTS public.user_skill_installs;
DROP TABLE IF EXISTS public.skill_catalog;
