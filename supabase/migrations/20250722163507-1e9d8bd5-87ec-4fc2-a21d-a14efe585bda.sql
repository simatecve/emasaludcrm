
-- Crear tabla para diagnósticos/historia médica de pacientes
CREATE TABLE public.diagnosticos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL,
  fecha_diagnostico DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT,
  observaciones TEXT,
  medico_tratante TEXT,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto', 'en_tratamiento')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar índice para mejorar el rendimiento de consultas
CREATE INDEX idx_diagnosticos_paciente_id ON public.diagnosticos(paciente_id);
CREATE INDEX idx_diagnosticos_fecha ON public.diagnosticos(fecha_diagnostico);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para diagnósticos
CREATE POLICY "Usuarios autenticados pueden leer diagnósticos" 
  ON public.diagnosticos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar diagnósticos" 
  ON public.diagnosticos 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar diagnósticos" 
  ON public.diagnosticos 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar diagnósticos" 
  ON public.diagnosticos 
  FOR DELETE 
  USING (true);

-- Agregar trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_diagnosticos_updated_at
  BEFORE UPDATE ON public.diagnosticos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
