-- Insertar configuración de recetario para OSPSIP
-- Asumimos que OSPSIP usa el tipo de recetario 1
INSERT INTO public.recetarios_obra_social_config (obra_social_id, tipo_recetario, activo)
VALUES (
  (SELECT id FROM public.obras_sociales WHERE UPPER(nombre) LIKE '%OSPSIP%' LIMIT 1),
  1,
  true
)
ON CONFLICT DO NOTHING;