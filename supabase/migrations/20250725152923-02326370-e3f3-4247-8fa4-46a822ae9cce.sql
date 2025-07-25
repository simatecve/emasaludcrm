
-- Corregir la función change_user_password para usar la API correcta de Supabase
CREATE OR REPLACE FUNCTION public.change_user_password(target_user_id uuid, new_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Verificar que el usuario actual sea admin
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('error', 'Solo administradores pueden cambiar contraseñas');
  END IF;
  
  -- Usar la función correcta para cambiar la contraseña
  PERFORM auth.admin_update_user_by_id(target_user_id, jsonb_build_object('password', new_password));
  
  RETURN json_build_object('success', true);
EXCEPTION
  WHEN others THEN
    RETURN json_build_object('error', 'Error al cambiar la contraseña: ' || SQLERRM);
END;
$function$
