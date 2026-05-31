-- Super admin role on profiles + protection against demotion/deletion

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_protected boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'super_admin'));

COMMENT ON COLUMN public.profiles.role IS 'Application role: user | super_admin';
COMMENT ON COLUMN public.profiles.is_protected IS 'When true, role cannot be demoted and row cannot be deleted';

CREATE OR REPLACE FUNCTION public.protect_super_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.is_protected = true THEN
    RAISE EXCEPTION 'Cannot delete protected super admin profile';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_protected = true THEN
    IF NEW.role <> 'super_admin' OR NEW.is_protected = false THEN
      RAISE EXCEPTION 'Cannot modify protected super admin role';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS protect_super_admin_before_update ON public.profiles;
CREATE TRIGGER protect_super_admin_before_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_super_admin_profile();

DROP TRIGGER IF EXISTS protect_super_admin_before_delete ON public.profiles;
CREATE TRIGGER protect_super_admin_before_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_super_admin_profile();
