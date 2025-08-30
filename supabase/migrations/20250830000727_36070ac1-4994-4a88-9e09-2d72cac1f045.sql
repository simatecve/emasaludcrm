
-- Crear tabla para múltiples prestaciones en una autorización
CREATE TABLE public.autorizacion_prestaciones (
  id SERIAL PRIMARY KEY,
  autorizacion_id INTEGER NOT NULL REFERENCES autorizaciones(id) ON DELETE CASCADE,
  prestacion_codigo TEXT NOT NULL,
  prestacion_descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.autorizacion_prestaciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para la nueva tabla
CREATE POLICY "Usuarios autenticados pueden leer prestaciones de autorizaciones"
  ON public.autorizacion_prestaciones
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar prestaciones de autorizaciones"
  ON public.autorizacion_prestaciones
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar prestaciones de autorizaciones"
  ON public.autorizacion_prestaciones
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar prestaciones de autorizaciones"
  ON public.autorizacion_prestaciones
  FOR DELETE
  TO authenticated
  USING (true);

-- Agregar trigger para updated_at
CREATE TRIGGER update_autorizacion_prestaciones_updated_at
  BEFORE UPDATE ON public.autorizacion_prestaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrar datos existentes de prestaciones individuales a la nueva tabla
INSERT INTO public.autorizacion_prestaciones (
  autorizacion_id, 
  prestacion_codigo, 
  prestacion_descripcion, 
  cantidad, 
  observaciones
)
SELECT 
  id,
  COALESCE(prestacion_codigo, ''),
  COALESCE(prestacion_descripcion, ''),
  COALESCE(prestacion_cantidad, 1),
  observacion_prestacion
FROM public.autorizaciones 
WHERE prestacion_codigo IS NOT NULL OR prestacion_descripcion IS NOT NULL;
