-- Eliminar la política RESTRICTIVE existente
DROP POLICY IF EXISTS "Administradores pueden ver todos los usuarios" ON public.users;

-- Crear una política PERMISSIVE que permita a usuarios ver su propio perfil y a admins ver todos
CREATE POLICY "Usuarios pueden ver sus propios datos" ON public.users
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR auth.uid() = id
);