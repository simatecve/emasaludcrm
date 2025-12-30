-- Eliminar políticas existentes restrictivas
DROP POLICY IF EXISTS "Admin puede insertar en nomeclador" ON public.nomeclador;
DROP POLICY IF EXISTS "Admin puede actualizar nomeclador" ON public.nomeclador;
DROP POLICY IF EXISTS "Admin puede eliminar nomeclador" ON public.nomeclador;

-- Crear nueva política de INSERT para admin, usuario_normal y prestador
CREATE POLICY "Admin, usuario_normal y prestador pueden insertar nomeclador" 
ON public.nomeclador
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR has_role(auth.uid(), 'prestador'::app_role)
);

-- Crear nueva política de UPDATE para admin, usuario_normal y prestador
CREATE POLICY "Admin, usuario_normal y prestador pueden actualizar nomeclador" 
ON public.nomeclador
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR has_role(auth.uid(), 'prestador'::app_role)
);

-- Crear nueva política de DELETE para admin, usuario_normal y prestador
CREATE POLICY "Admin, usuario_normal y prestador pueden eliminar nomeclador" 
ON public.nomeclador
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR has_role(auth.uid(), 'prestador'::app_role)
);