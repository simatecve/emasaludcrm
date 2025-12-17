import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { consultas_maximas } = await req.json();
    
    if (typeof consultas_maximas !== 'number' || consultas_maximas < 1) {
      return new Response(
        JSON.stringify({ error: 'consultas_maximas debe ser un número positivo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Actualizando consultas_maximas a ${consultas_maximas} para todos los pacientes activos`);

    const { data, error, count } = await supabase
      .from('pacientes')
      .update({ 
        consultas_maximas: consultas_maximas,
        updated_at: new Date().toISOString()
      })
      .eq('activo', true)
      .select('id');

    if (error) {
      console.error('Error actualizando pacientes:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedCount = data?.length || 0;
    console.log(`Actualizados ${updatedCount} pacientes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Se actualizaron ${updatedCount} pacientes con consultas_maximas = ${consultas_maximas}`,
        count: updatedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en update-consultas-maximas:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
