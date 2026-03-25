
ALTER TABLE public.recetarios_emitidos 
ADD COLUMN numero_recetario SERIAL;

CREATE OR REPLACE FUNCTION public.get_next_recetario_number()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(numero_recetario), 0) + 1 FROM public.recetarios_emitidos;
$$;
