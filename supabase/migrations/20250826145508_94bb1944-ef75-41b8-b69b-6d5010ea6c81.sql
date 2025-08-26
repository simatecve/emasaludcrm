
-- Verificamos el estado actual de la secuencia y la tabla
SELECT MAX(id) as max_id FROM pacientes;
SELECT last_value FROM pacientes_id_seq;

-- Sincronizamos la secuencia con el valor máximo actual de la tabla
SELECT setval('pacientes_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM pacientes;

-- Verificamos que la columna id tenga el default correcto
ALTER TABLE pacientes ALTER COLUMN id SET DEFAULT nextval('pacientes_id_seq'::regclass);

-- Aseguramos que la secuencia sea propiedad de la columna
ALTER SEQUENCE pacientes_id_seq OWNED BY pacientes.id;
