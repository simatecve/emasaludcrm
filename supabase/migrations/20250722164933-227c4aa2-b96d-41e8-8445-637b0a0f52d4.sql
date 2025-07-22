
-- Crear enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'usuario_normal', 'prestador');

-- Crear tabla para logs de auditoría
CREATE TABLE public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);

-- Actualizar tabla users para incluir el enum de roles
ALTER TABLE public.users ALTER COLUMN role TYPE user_role USING role::user_role;
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'usuario_normal';

-- Habilitar RLS en audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para audit_logs (solo admin puede ver todos los logs)
CREATE POLICY "Solo admin puede ver audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Sistema puede insertar audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Actualizar políticas RLS para users
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.users;

CREATE POLICY "Usuarios pueden ver su propio perfil" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Solo admin puede ver todos los usuarios" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Solo admin puede crear usuarios" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Solo admin puede actualizar usuarios" 
  ON public.users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Función para crear logs de auditoría automáticamente
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr()
  );
END;
$$;

-- Actualizar políticas RLS según roles para otras tablas

-- Pacientes: Admin y usuario_normal pueden todo, prestador solo lectura
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar pacientes" ON public.pacientes;

CREATE POLICY "Usuarios pueden leer pacientes según rol" 
  ON public.pacientes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal', 'prestador')
    )
  );

CREATE POLICY "Admin y usuario_normal pueden insertar pacientes" 
  ON public.pacientes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal')
    )
  );

CREATE POLICY "Admin y usuario_normal pueden actualizar pacientes" 
  ON public.pacientes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal')
    )
  );

CREATE POLICY "Solo admin puede eliminar pacientes" 
  ON public.pacientes 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Autorizaciones: Todos pueden leer y crear, solo admin puede eliminar
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer autorizaciones" ON public.autorizaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar autorizaciones" ON public.autorizaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar autorizaciones" ON public.autorizaciones;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar autorizaciones" ON public.autorizaciones;

CREATE POLICY "Usuarios pueden leer autorizaciones según rol" 
  ON public.autorizaciones 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal', 'prestador')
    )
  );

CREATE POLICY "Usuarios pueden insertar autorizaciones según rol" 
  ON public.autorizaciones 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal', 'prestador')
    )
  );

CREATE POLICY "Usuarios pueden actualizar autorizaciones según rol" 
  ON public.autorizaciones 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'usuario_normal', 'prestador')
    )
  );

CREATE POLICY "Solo admin puede eliminar autorizaciones" 
  ON public.autorizaciones 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Remover límite de 1000 registros del nomenclador habilitando RLS
ALTER TABLE public.nomeclador ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden leer nomenclador completo" 
  ON public.nomeclador 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid()
    )
  );
