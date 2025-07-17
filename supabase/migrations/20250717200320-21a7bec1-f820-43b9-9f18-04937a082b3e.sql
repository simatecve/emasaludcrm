
-- Agregar campos para prestaciones y datos adicionales en autorizaciones
ALTER TABLE public.autorizaciones 
ADD COLUMN prestacion_codigo text,
ADD COLUMN prestacion_descripcion text,
ADD COLUMN prestacion_cantidad integer DEFAULT 1,
ADD COLUMN prestador text,
ADD COLUMN observacion_prestacion text,
ADD COLUMN numero_credencial text,
ADD COLUMN parentesco_beneficiario text,
ADD COLUMN profesional_solicitante text;

-- Crear índice para mejorar la búsqueda por código de prestación
CREATE INDEX IF NOT EXISTS idx_autorizaciones_prestacion_codigo ON public.autorizaciones(prestacion_codigo);
