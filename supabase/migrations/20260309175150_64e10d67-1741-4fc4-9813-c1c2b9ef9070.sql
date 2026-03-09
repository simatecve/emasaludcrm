
-- Add billing columns to autorizaciones
ALTER TABLE public.autorizaciones 
  ADD COLUMN IF NOT EXISTS estado_facturacion text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS lote_facturacion_id integer;

-- Add precio column to autorizacion_prestaciones
ALTER TABLE public.autorizacion_prestaciones 
  ADD COLUMN IF NOT EXISTS precio numeric NOT NULL DEFAULT 0;

-- Create lotes_facturacion table
CREATE TABLE public.lotes_facturacion (
  id serial PRIMARY KEY,
  obra_social_id integer REFERENCES public.obras_sociales(id),
  fecha_desde date NOT NULL,
  fecha_hasta date NOT NULL,
  total numeric NOT NULL DEFAULT 0,
  cantidad_estudios integer NOT NULL DEFAULT 0,
  numero_lote text NOT NULL,
  estado text NOT NULL DEFAULT 'generado',
  observaciones text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comprobantes_particulares table
CREATE TABLE public.comprobantes_particulares (
  id serial PRIMARY KEY,
  autorizacion_id integer NOT NULL REFERENCES public.autorizaciones(id),
  paciente_id integer NOT NULL REFERENCES public.pacientes(id),
  monto numeric NOT NULL,
  fecha_emision date NOT NULL DEFAULT CURRENT_DATE,
  fecha_pago date,
  estado text NOT NULL DEFAULT 'pendiente',
  metodo_pago text,
  numero_comprobante text NOT NULL,
  observaciones text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add FK from autorizaciones to lotes_facturacion
ALTER TABLE public.autorizaciones 
  ADD CONSTRAINT autorizaciones_lote_facturacion_id_fkey 
  FOREIGN KEY (lote_facturacion_id) REFERENCES public.lotes_facturacion(id);

-- Enable RLS
ALTER TABLE public.lotes_facturacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_particulares ENABLE ROW LEVEL SECURITY;

-- RLS policies for lotes_facturacion
CREATE POLICY "Admin y usuario_normal pueden leer lotes" ON public.lotes_facturacion
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin y usuario_normal pueden insertar lotes" ON public.lotes_facturacion
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin y usuario_normal pueden actualizar lotes" ON public.lotes_facturacion
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin pueden eliminar lotes" ON public.lotes_facturacion
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for comprobantes_particulares
CREATE POLICY "Admin y usuario_normal pueden leer comprobantes" ON public.comprobantes_particulares
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin y usuario_normal pueden insertar comprobantes" ON public.comprobantes_particulares
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin y usuario_normal pueden actualizar comprobantes" ON public.comprobantes_particulares
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'usuario_normal'::app_role));

CREATE POLICY "Admin pueden eliminar comprobantes" ON public.comprobantes_particulares
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at triggers
CREATE TRIGGER update_lotes_facturacion_updated_at
  BEFORE UPDATE ON public.lotes_facturacion
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comprobantes_particulares_updated_at
  BEFORE UPDATE ON public.comprobantes_particulares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
