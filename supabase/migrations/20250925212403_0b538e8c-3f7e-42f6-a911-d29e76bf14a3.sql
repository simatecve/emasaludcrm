-- Crear tabla para credenciales
CREATE TABLE public.credenciales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id INTEGER NOT NULL,
  numero_credencial TEXT NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.credenciales ENABLE ROW LEVEL SECURITY;

-- Crear políticas para credenciales
CREATE POLICY "Usuarios autenticados pueden leer credenciales" 
ON public.credenciales 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar credenciales" 
ON public.credenciales 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar credenciales" 
ON public.credenciales 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar credenciales" 
ON public.credenciales 
FOR DELETE 
USING (true);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_credenciales_updated_at
BEFORE UPDATE ON public.credenciales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_credenciales_paciente_id ON public.credenciales(paciente_id);
CREATE INDEX idx_credenciales_numero ON public.credenciales(numero_credencial);
CREATE INDEX idx_credenciales_estado ON public.credenciales(estado);