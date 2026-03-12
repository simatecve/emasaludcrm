import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { patients, obra_social_id } = await req.json();

    if (!patients || !Array.isArray(patients)) {
      return new Response(JSON.stringify({ error: "patients array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let created = 0;
    let updated = 0;
    let errors: { dni: string; error: string }[] = [];

    for (const p of patients) {
      try {
        // Check if patient already exists by DNI
        const { data: existing } = await supabase
          .from("pacientes")
          .select("id")
          .eq("dni", p.dni)
          .eq("activo", true)
          .maybeSingle();

        if (existing) {
          // Update existing patient
          const { error } = await supabase
            .from("pacientes")
            .update({
              nombre: p.nombre,
              apellido: p.apellido,
              apellido_y_nombre: `${p.apellido}, ${p.nombre}`,
              sexo: p.sexo,
              fecha_nacimiento: p.fecha_nacimiento || null,
              estado_civil: p.estado_civil,
              tipo_doc: p.tipo_doc || "DNI",
              nro_doc: p.dni,
              cuil_beneficiario: p.cuil_beneficiario,
              nacionalidad: p.nacionalidad,
              direccion: p.direccion,
              localidad: p.localidad,
              provincia: p.provincia,
              parentesco: p.parentesco,
              cuil_titular: p.cuil_titular,
              numero_afiliado: p.numero_afiliado,
              plan: p.plan,
              obra_social_id: obra_social_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
          updated++;
        } else {
          // Create new patient
          const { error } = await supabase.from("pacientes").insert({
            dni: p.dni,
            nombre: p.nombre,
            apellido: p.apellido,
            apellido_y_nombre: `${p.apellido}, ${p.nombre}`,
            sexo: p.sexo,
            fecha_nacimiento: p.fecha_nacimiento || null,
            estado_civil: p.estado_civil,
            tipo_doc: p.tipo_doc || "DNI",
            nro_doc: p.dni,
            cuil_beneficiario: p.cuil_beneficiario,
            nacionalidad: p.nacionalidad,
            direccion: p.direccion,
            localidad: p.localidad,
            provincia: p.provincia,
            parentesco: p.parentesco,
            cuil_titular: p.cuil_titular,
            numero_afiliado: p.numero_afiliado,
            plan: p.plan,
            obra_social_id: obra_social_id,
            consultas_maximas: 999,
            activo: true,
          });

          if (error) throw error;
          created++;
        }
      } catch (err: any) {
        errors.push({ dni: p.dni || "unknown", error: err.message });
      }
    }

    return new Response(
      JSON.stringify({ created, updated, errors, total: patients.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
