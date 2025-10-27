-- Crear tabla para tipos de recetarios
CREATE TABLE IF NOT EXISTS public.recetarios_tipos (
  id integer PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now()
);

-- Insertar los 3 tipos de recetarios
INSERT INTO public.recetarios_tipos (id, nombre, descripcion) VALUES
  (1, 'Recetario Tipo 1', 'Recetario estándar'),
  (2, 'Recetario Tipo 2', 'Recetario con autorización'),
  (3, 'Recetario Tipo 3', 'Recetario especial')
ON CONFLICT (id) DO NOTHING;

-- Crear tabla de configuración: obra social -> tipo de recetario
CREATE TABLE IF NOT EXISTS public.recetarios_obra_social_config (
  id serial PRIMARY KEY,
  obra_social_id integer NOT NULL REFERENCES public.obras_sociales(id) ON DELETE CASCADE,
  tipo_recetario integer NOT NULL REFERENCES public.recetarios_tipos(id),
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(obra_social_id)
);

-- Crear tabla de recetarios emitidos
CREATE TABLE IF NOT EXISTS public.recetarios_emitidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id integer NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  obra_social_id integer NOT NULL REFERENCES public.obras_sociales(id),
  tipo_recetario integer NOT NULL REFERENCES public.recetarios_tipos(id),
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  mes_control text NOT NULL,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índice para búsquedas rápidas por mes
CREATE INDEX IF NOT EXISTS idx_recetarios_emitidos_mes ON public.recetarios_emitidos(paciente_id, mes_control);

-- Enable RLS
ALTER TABLE public.recetarios_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetarios_obra_social_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetarios_emitidos ENABLE ROW LEVEL SECURITY;

-- RLS Policies para recetarios_tipos
CREATE POLICY "Usuarios autenticados pueden leer tipos de recetarios"
  ON public.recetarios_tipos
  FOR SELECT
  USING (true);

-- RLS Policies para recetarios_obra_social_config
CREATE POLICY "Usuarios autenticados pueden leer configuración"
  ON public.recetarios_obra_social_config
  FOR SELECT
  USING (true);

CREATE POLICY "Admin puede insertar configuración"
  ON public.recetarios_obra_social_config
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin puede actualizar configuración"
  ON public.recetarios_obra_social_config
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin puede eliminar configuración"
  ON public.recetarios_obra_social_config
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para recetarios_emitidos
CREATE POLICY "Admin y usuario_normal pueden insertar recetarios"
  ON public.recetarios_emitidos
  FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'usuario_normal'::app_role)
  );

CREATE POLICY "Pacientes pueden ver solo sus recetarios"
  ON public.recetarios_emitidos
  FOR SELECT
  USING (
    (has_role(auth.uid(), 'paciente'::app_role) AND 
     EXISTS (
       SELECT 1 FROM users u 
       JOIN pacientes p ON u.dni = p.dni 
       WHERE u.id = auth.uid() AND recetarios_emitidos.paciente_id = p.id
     )) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'usuario_normal'::app_role)
  );

CREATE POLICY "Admin y usuario_normal pueden actualizar recetarios"
  ON public.recetarios_emitidos
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'usuario_normal'::app_role)
  );

CREATE POLICY "Admin puede eliminar recetarios"
  ON public.recetarios_emitidos
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_recetarios_obra_social_config_updated_at
  BEFORE UPDATE ON public.recetarios_obra_social_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recetarios_emitidos_updated_at
  BEFORE UPDATE ON public.recetarios_emitidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();