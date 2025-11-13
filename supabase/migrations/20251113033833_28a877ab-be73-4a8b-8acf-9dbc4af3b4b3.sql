-- Agregar campo copago a la tabla autorizaciones
ALTER TABLE public.autorizaciones 
ADD COLUMN copago numeric(10,2);

COMMENT ON COLUMN public.autorizaciones.copago IS 'Monto del copago o a cargo del paciente';