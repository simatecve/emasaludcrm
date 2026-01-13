-- Agregar columna plan a la tabla pacientes
ALTER TABLE public.pacientes 
ADD COLUMN plan VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN public.pacientes.plan IS 'Tipo de plan: PMO (común), PMO SD (Servicio Doméstico), PMO MT (Monotributistas)';

-- Actualizar los 60 pacientes de San Juan (OSPIV) con plan PMO
UPDATE public.pacientes 
SET plan = 'PMO'
WHERE obra_social_id = 13 
  AND activo = true;