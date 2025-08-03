
-- Create a table for patient tags/labels
CREATE TABLE public.patient_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tags for patient process tracking
INSERT INTO public.patient_tags (name, color, description) VALUES
  ('registrado', '#10B981', 'Paciente registrado en el sistema'),
  ('turno_practica', '#F59E0B', 'Paciente con turno programado para práctica'),
  ('autorizacion', '#EF4444', 'Paciente requiere autorización'),
  ('completado', '#8B5CF6', 'Proceso completado');

-- Add tag_id column to patients table
ALTER TABLE public.pacientes 
ADD COLUMN tag_id INTEGER REFERENCES public.patient_tags(id);

-- Set default tag for existing patients
UPDATE public.pacientes 
SET tag_id = (SELECT id FROM public.patient_tags WHERE name = 'registrado' LIMIT 1)
WHERE tag_id IS NULL;

-- Enable RLS for patient_tags
ALTER TABLE public.patient_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_tags
CREATE POLICY "Usuarios autenticados pueden leer etiquetas de pacientes" 
  ON public.patient_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar etiquetas de pacientes" 
  ON public.patient_tags 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar etiquetas de pacientes" 
  ON public.patient_tags 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar etiquetas de pacientes" 
  ON public.patient_tags 
  FOR DELETE 
  USING (true);

-- Create trigger to update updated_at column
CREATE OR REPLACE TRIGGER update_patient_tags_updated_at
  BEFORE UPDATE ON public.patient_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
