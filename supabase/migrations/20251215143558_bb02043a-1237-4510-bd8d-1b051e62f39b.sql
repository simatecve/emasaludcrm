-- Drop the existing SELECT policy for pacientes
DROP POLICY IF EXISTS "Pacientes pueden ver solo sus datos" ON public.pacientes;

-- Create updated policy that includes prestador role
CREATE POLICY "Pacientes pueden ver solo sus datos" 
ON public.pacientes 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'paciente'::app_role) AND (EXISTS ( 
    SELECT 1
    FROM users
    WHERE ((users.id = auth.uid()) AND (users.dni = pacientes.dni))
  ))) 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'usuario_normal'::app_role)
  OR has_role(auth.uid(), 'prestador'::app_role)
);