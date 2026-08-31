INSERT INTO public.user_roles (user_id, role)
SELECT id, 'ADMIN'
FROM auth.users
WHERE email = 'sosadm303@gmail.com'
AND NOT EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_roles.user_id = auth.users.id
  AND user_roles.role = 'ADMIN'
);