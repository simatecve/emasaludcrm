
-- Fix: Change autorizaciones SELECT policy to PERMISSIVE so admin and others can actually see data
DROP POLICY IF EXISTS "Control de acceso a autorizaciones" ON public.autorizaciones;

CREATE POLICY "Control de acceso a autorizaciones"
ON public.autorizaciones
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR (has_role(auth.uid(), 'prestador'::app_role) AND created_by_user_id = auth.uid())
  OR (has_role(auth.uid(), 'paciente'::app_role) AND EXISTS (
    SELECT 1 FROM users u JOIN pacientes p ON u.dni = p.dni
    WHERE u.id = auth.uid() AND autorizaciones.paciente_id = p.id
  ))
);
