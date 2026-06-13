-- Align skills RLS policies with other user-owned tables (plan_files, etc.)

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
