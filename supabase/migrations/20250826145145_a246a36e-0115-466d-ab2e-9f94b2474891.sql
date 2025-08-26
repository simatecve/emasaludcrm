
-- Verificamos las restricciones existentes
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'pacientes'::regclass;

-- Intentamos eliminar todas las restricciones problemáticas de manera más específica
DO $$ 
BEGIN
    -- Eliminamos restricciones únicas si existen
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pacientes_dni_key' AND conrelid = 'pacientes'::regclass) THEN
        ALTER TABLE pacientes DROP CONSTRAINT pacientes_dni_key;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pacientes_email_key' AND conrelid = 'pacientes'::regclass) THEN
        ALTER TABLE pacientes DROP CONSTRAINT pacientes_email_key;
    END IF;
    
    -- Si hay una clave primaria compuesta problemática, la eliminamos
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pacientes_pkey' AND conrelid = 'pacientes'::regclass) THEN
        -- Primero eliminamos las referencias de otras tablas si existen
        ALTER TABLE IF EXISTS consultas DROP CONSTRAINT IF EXISTS consultas_paciente_id_fkey;
        ALTER TABLE IF EXISTS diagnosticos DROP CONSTRAINT IF EXISTS diagnosticos_paciente_id_fkey;
        ALTER TABLE IF EXISTS turnos DROP CONSTRAINT IF EXISTS turnos_paciente_id_fkey;
        ALTER TABLE IF EXISTS autorizaciones DROP CONSTRAINT IF EXISTS autorizaciones_paciente_id_fkey;
        
        -- Ahora eliminamos la clave primaria
        ALTER TABLE pacientes DROP CONSTRAINT pacientes_pkey;
    END IF;
END $$;

-- Recreamos la clave primaria solo en el campo id
ALTER TABLE pacientes ADD CONSTRAINT pacientes_pkey PRIMARY KEY (id);

-- Recreamos las foreign keys que eliminamos
ALTER TABLE consultas ADD CONSTRAINT consultas_paciente_id_fkey 
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id);
    
ALTER TABLE diagnosticos ADD CONSTRAINT diagnosticos_paciente_id_fkey 
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id);
    
ALTER TABLE turnos ADD CONSTRAINT turnos_paciente_id_fkey 
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id);
    
ALTER TABLE autorizaciones ADD CONSTRAINT autorizaciones_paciente_id_fkey 
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id);

-- Agregamos restricción única solo para DNI
ALTER TABLE pacientes ADD CONSTRAINT pacientes_dni_unique UNIQUE (dni);

-- Aseguramos que todos los campos opcionales puedan ser NULL
ALTER TABLE pacientes ALTER COLUMN obra_social_id DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN numero_afiliado DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN tag_id DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN cuil_titular DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN cuil_beneficiario DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN tipo_doc DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN nro_doc DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN descripcion_paciente DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN parentesco DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN apellido_y_nombre DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN sexo DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN estado_civil DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN nacionalidad DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN fecha_nac_adicional DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN tipo_doc_familiar DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN nro_doc_familiar DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN localidad DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN provincia DROP NOT NULL;
ALTER TABLE pacientes ALTER COLUMN observaciones DROP NOT NULL;
