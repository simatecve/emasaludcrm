
-- Primero, eliminamos cualquier restricción de clave única problemática en pacientes
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_pkey;
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_dni_key;
ALTER TABLE public.pacientes DROP CONSTRAINT IF EXISTS pacientes_email_key;

-- Recreamos la clave primaria
ALTER TABLE public.pacientes ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);

-- Permitimos valores NULL en todos los campos excepto los básicos obligatorios
ALTER TABLE public.pacientes ALTER COLUMN nombre SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN apellido SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN dni SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN fecha_nacimiento SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN telefono SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN direccion SET NOT NULL;

-- Todos los demás campos pueden ser NULL
ALTER TABLE public.pacientes ALTER COLUMN cuil_titular DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN cuil_beneficiario DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN tipo_doc DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN nro_doc DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN descripcion_paciente DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN parentesco DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN apellido_y_nombre DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN sexo DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN estado_civil DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN nacionalidad DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN tipo_doc_familiar DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN nro_doc_familiar DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN localidad DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN provincia DROP NOT NULL;
ALTER TABLE public.pacientes ALTER COLUMN observaciones DROP NOT NULL;

-- Agregamos una restricción única solo para DNI (que es obligatorio)
ALTER TABLE public.pacientes ADD CONSTRAINT pacientes_dni_unique UNIQUE (dni);
