
-- Eliminar las políticas existentes restrictivas
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.users;

-- Crear nuevas políticas más flexibles para administradores
CREATE POLICY "Administradores pueden ver todos los usuarios"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR auth.uid()::text = id::text
);

CREATE POLICY "Administradores pueden actualizar usuarios"
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Administradores pueden insertar usuarios"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Crear función para cambiar contraseña
CREATE OR REPLACE FUNCTION public.change_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verificar que el usuario actual sea admin
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('error', 'Solo administradores pueden cambiar contraseñas');
  END IF;
  
  -- Cambiar la contraseña usando la función admin
  PERFORM auth.admin_update_user_by_id(target_user_id, json_build_object('password', new_password));
  
  RETURN json_build_object('success', true);
END;
$$;

-- Crear función para auditoría que funcione correctamente
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values, ip_address)
  VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_new_values,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
END;
$$;

-- Crear tabla audit_logs si no existe
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan ver logs
CREATE POLICY "Solo administradores pueden ver audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
