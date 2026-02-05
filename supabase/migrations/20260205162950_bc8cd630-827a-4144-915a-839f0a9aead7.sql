-- Insertar el usuario admin@ema.com en la tabla users con username único
INSERT INTO public.users (id, email, username, full_name, role, is_active)
VALUES (
  '032d30c3-d28d-4205-99fc-f0ada8c165d1',
  'admin@ema.com',
  'admin_ema',
  'Administrador EMA',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;

-- Asignar el rol de admin en user_roles
INSERT INTO public.user_roles (user_id, role)
VALUES ('032d30c3-d28d-4205-99fc-f0ada8c165d1', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;