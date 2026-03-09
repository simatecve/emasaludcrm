import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutorizacionFacturable {
  id: number;
  paciente_id: number;
  obra_social_id: number | null;
  medico_id: number | null;
  tipo_autorizacion: string;
  fecha_solicitud: string;
  fecha_vencimiento: string | null;
  estado: string;
  estado_facturacion: string;
  numero_autorizacion: string | null;
  lote_facturacion_id: number | null;
  pacientes: { nombre: string; apellido: string; dni: string; numero_afiliado: string | null } | null;
  medicos: { nombre: string; apellido: string; matricula: string } | null;
  obras_sociales: { nombre: string } | null;
  prestaciones: Array<{
    id: number;
    prestacion_codigo: string;
    prestacion_descripcion: string;
    cantidad: number;
    precio: number;
    observaciones: string | null;
  }>;
}

export interface LoteFacturacion {
  id: number;
  obra_social_id: number | null;
  fecha_desde: string;
  fecha_hasta: string;
  total: number;
  cantidad_estudios: number;
  numero_lote: string;
  estado: string;
  observaciones: string | null;
  created_at: string;
  obras_sociales: { nombre: string } | null;
}

export interface ComprobanteParticular {
  id: number;
  autorizacion_id: number;
  paciente_id: number;
  monto: number;
  fecha_emision: string;
  fecha_pago: string | null;
  estado: string;
  metodo_pago: string | null;
  numero_comprobante: string;
  observaciones: string | null;
  created_at: string;
  pacientes: { nombre: string; apellido: string; dni: string } | null;
}

// Fetch approved authorizations pending billing
export const useAutorizacionesPendientesFacturacion = (filters?: {
  obraSocialId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  medicoId?: number;
}) => {
  return useQuery({
    queryKey: ['autorizaciones-facturacion', filters],
    queryFn: async () => {
      let query = supabase
        .from('autorizaciones')
        .select(`
          id, paciente_id, obra_social_id, medico_id, tipo_autorizacion,
          fecha_solicitud, fecha_vencimiento, estado, estado_facturacion,
          numero_autorizacion, lote_facturacion_id,
          pacientes (nombre, apellido, dni, numero_afiliado),
          medicos (nombre, apellido, matricula),
          obras_sociales (nombre)
        `)
        .eq('activa', true)
        .eq('estado', 'aprobada')
        .eq('estado_facturacion', 'pendiente');

      if (filters?.obraSocialId) {
        query = query.eq('obra_social_id', filters.obraSocialId);
      }
      if (filters?.fechaDesde) {
        query = query.gte('fecha_solicitud', filters.fechaDesde);
      }
      if (filters?.fechaHasta) {
        query = query.lte('fecha_solicitud', filters.fechaHasta);
      }
      if (filters?.medicoId) {
        query = query.eq('medico_id', filters.medicoId);
      }

      const { data, error } = await query.order('fecha_solicitud', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [] as AutorizacionFacturable[];

      const ids = data.map(a => a.id);
      const { data: prestaciones, error: pErr } = await supabase
        .from('autorizacion_prestaciones')
        .select('id, autorizacion_id, prestacion_codigo, prestacion_descripcion, cantidad, precio, observaciones')
        .in('autorizacion_id', ids);
      if (pErr) throw pErr;

      const map = new Map<number, typeof prestaciones>();
      for (const p of (prestaciones || [])) {
        const list = map.get(p.autorizacion_id) || [];
        list.push(p);
        map.set(p.autorizacion_id, list);
      }

      return data.map(a => ({
        ...a,
        prestaciones: map.get(a.id) || []
      })) as AutorizacionFacturable[];
    },
  });
};

// Fetch particular (no OS) pending
export const useAutorizacionesParticularesPendientes = () => {
  return useQuery({
    queryKey: ['autorizaciones-particulares-pendientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autorizaciones')
        .select(`
          id, paciente_id, obra_social_id, medico_id, tipo_autorizacion,
          fecha_solicitud, fecha_vencimiento, estado, estado_facturacion,
          numero_autorizacion, lote_facturacion_id,
          pacientes (nombre, apellido, dni, numero_afiliado),
          medicos (nombre, apellido, matricula)
        `)
        .eq('activa', true)
        .eq('estado', 'aprobada')
        .eq('estado_facturacion', 'pendiente')
        .is('obra_social_id', null)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [] as AutorizacionFacturable[];

      const ids = data.map(a => a.id);
      const { data: prestaciones, error: pErr } = await supabase
        .from('autorizacion_prestaciones')
        .select('id, autorizacion_id, prestacion_codigo, prestacion_descripcion, cantidad, precio, observaciones')
        .in('autorizacion_id', ids);
      if (pErr) throw pErr;

      const map = new Map<number, typeof prestaciones>();
      for (const p of (prestaciones || [])) {
        const list = map.get(p.autorizacion_id) || [];
        list.push(p);
        map.set(p.autorizacion_id, list);
      }

      return data.map(a => ({
        ...a,
        obras_sociales: null,
        prestaciones: map.get(a.id) || []
      })) as AutorizacionFacturable[];
    },
  });
};

// Generate billing batch
export const useGenerarLote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      obraSocialId,
      fechaDesde,
      fechaHasta,
      autorizacionIds,
      total,
      observaciones,
    }: {
      obraSocialId: number | null;
      fechaDesde: string;
      fechaHasta: string;
      autorizacionIds: number[];
      total: number;
      observaciones?: string;
    }) => {
      const numeroLote = `LOTE-${Date.now()}`;

      const { data: lote, error: loteErr } = await supabase
        .from('lotes_facturacion')
        .insert({
          obra_social_id: obraSocialId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
          total,
          cantidad_estudios: autorizacionIds.length,
          numero_lote: numeroLote,
          estado: 'generado',
          observaciones: observaciones || null,
        })
        .select()
        .single();

      if (loteErr) throw loteErr;

      const { error: updateErr } = await supabase
        .from('autorizaciones')
        .update({
          estado_facturacion: 'facturado',
          lote_facturacion_id: lote.id,
        })
        .in('id', autorizacionIds);

      if (updateErr) throw updateErr;

      return lote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones-facturacion'] });
      queryClient.invalidateQueries({ queryKey: ['autorizaciones-particulares-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['lotes-facturacion'] });
      queryClient.invalidateQueries({ queryKey: ['facturacion-reports'] });
      toast({ title: "Lote generado", description: "El lote de facturación se ha generado exitosamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Lotes list
export const useLotesFacturacion = () => {
  return useQuery({
    queryKey: ['lotes-facturacion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lotes_facturacion')
        .select('*, obras_sociales (nombre)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LoteFacturacion[];
    },
  });
};

// Update lote status
export const useUpdateLoteEstado = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: string }) => {
      const { error } = await supabase
        .from('lotes_facturacion')
        .update({ estado })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes-facturacion'] });
      toast({ title: "Lote actualizado", description: "El estado del lote se ha actualizado." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Comprobantes particulares
export const useComprobantesParticulares = () => {
  return useQuery({
    queryKey: ['comprobantes-particulares'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comprobantes_particulares')
        .select('*, pacientes (nombre, apellido, dni)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ComprobanteParticular[];
    },
  });
};

export const useCrearComprobante = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      autorizacion_id: number;
      paciente_id: number;
      monto: number;
      numero_comprobante: string;
      observaciones?: string;
    }) => {
      // Create receipt
      const { error: compErr } = await supabase
        .from('comprobantes_particulares')
        .insert(data);
      if (compErr) throw compErr;

      // Mark authorization as billed
      const { error: updErr } = await supabase
        .from('autorizaciones')
        .update({ estado_facturacion: 'facturado' })
        .eq('id', data.autorizacion_id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprobantes-particulares'] });
      queryClient.invalidateQueries({ queryKey: ['autorizaciones-particulares-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['facturacion-reports'] });
      toast({ title: "Comprobante creado", description: "El comprobante se ha generado exitosamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useRegistrarPagoComprobante = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, metodo_pago, fecha_pago }: { id: number; metodo_pago: string; fecha_pago: string }) => {
      const { error } = await supabase
        .from('comprobantes_particulares')
        .update({ estado: 'pagado', metodo_pago, fecha_pago })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comprobantes-particulares'] });
      queryClient.invalidateQueries({ queryKey: ['facturacion-reports'] });
      toast({ title: "Pago registrado", description: "El pago se ha registrado exitosamente." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Reports data
export const useFacturacionReports = () => {
  return useQuery({
    queryKey: ['facturacion-reports'],
    queryFn: async () => {
      const [lotesRes, comprobantesRes, pendientesRes] = await Promise.all([
        supabase.from('lotes_facturacion').select('*, obras_sociales (nombre)'),
        supabase.from('comprobantes_particulares').select('*'),
        supabase.from('autorizaciones')
          .select('id', { count: 'exact', head: true })
          .eq('activa', true)
          .eq('estado', 'aprobada')
          .eq('estado_facturacion', 'pendiente'),
      ]);

      if (lotesRes.error) throw lotesRes.error;
      if (comprobantesRes.error) throw comprobantesRes.error;

      return {
        lotes: lotesRes.data || [],
        comprobantes: comprobantesRes.data || [],
        pendientesCount: pendientesRes.count || 0,
      };
    },
  });
};
