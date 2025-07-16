
-- Agregar nuevos campos a la tabla pacientes
ALTER TABLE public.pacientes 
ADD COLUMN cuil_titular text,
ADD COLUMN cuil_beneficiario text,
ADD COLUMN tipo_doc text,
ADD COLUMN nro_doc text,
ADD COLUMN descripcion_paciente text,
ADD COLUMN parentesco text,
ADD COLUMN apellido_y_nombre text,
ADD COLUMN sexo text,
ADD COLUMN estado_civil text,
ADD COLUMN nacionalidad text,
ADD COLUMN fecha_nac_adicional date,
ADD COLUMN tipo_doc_familiar text,
ADD COLUMN nro_doc_familiar text,
ADD COLUMN localidad text,
ADD COLUMN provincia text,
ADD COLUMN fecha_alta date DEFAULT CURRENT_DATE;
