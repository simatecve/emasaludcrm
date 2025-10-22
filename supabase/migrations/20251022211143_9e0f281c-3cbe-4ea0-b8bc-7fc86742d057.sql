-- Eliminar la columna modulo de la tabla nomeclador
ALTER TABLE public.nomeclador 
DROP COLUMN IF EXISTS modulo;