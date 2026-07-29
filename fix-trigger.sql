-- 修改handle_new_user函数，在插入前检查用户是否已存在
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
user_count int;
BEGIN
-- 检查用户是否已存在
IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
  RETURN NEW;
END IF;

SELECT COUNT(*) INTO user_count FROM public.profiles;
INSERT INTO public.profiles (id, email, phone, role)
VALUES (
  NEW.id,
  NEW.email,
  NEW.phone,
  CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
);
RETURN NEW;
END;
$$;

-- 修改handle_new_user_on_insert函数，在插入前检查用户是否已存在
CREATE OR REPLACE FUNCTION handle_new_user_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
user_count int;
BEGIN
-- 检查用户是否已存在
IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
  RETURN NEW;
END IF;

SELECT COUNT(*) INTO user_count FROM public.profiles;
INSERT INTO public.profiles (id, email, phone, role)
VALUES (
  NEW.id,
  NEW.email,
  NEW.phone,
  CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
);
RETURN NEW;
END;
$$;