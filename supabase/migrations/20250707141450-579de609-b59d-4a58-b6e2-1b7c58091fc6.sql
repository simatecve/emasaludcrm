
-- Agregar campo logo_url a la tabla system_config
ALTER TABLE public.system_config 
ADD COLUMN logo_url text DEFAULT 'https://cgtykkvyywmyfmtsjoyl.supabase.co/storage/v1/object/public/autorizaciones//Imagen%20de%20WhatsApp%202025-07-03%20a%20las%2011.24.17_bb8003a2.jpg';

-- Actualizar el registro existente con la URL del logo
UPDATE public.system_config 
SET logo_url = 'https://cgtykkvyywmyfmtsjoyl.supabase.co/storage/v1/object/public/autorizaciones//Imagen%20de%20WhatsApp%202025-07-03%20a%20las%2011.24.17_bb8003a2.jpg';
