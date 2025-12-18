-- Eliminar la política de INSERT existente
DROP POLICY IF EXISTS "Admin y usuario_normal pueden insertar autorizaciones" ON public.autorizaciones;

-- Crear nueva política que incluya prestadores
CREATE POLICY "Admin, usuario_normal y prestador pueden insertar autorizaciones" 
ON public.autorizaciones
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR has_role(auth.uid(), 'prestador'::app_role)
);