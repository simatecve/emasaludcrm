import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseDateMDY(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  let m = parseInt(parts[0]);
  let d = parseInt(parts[1]);
  let y = parseInt(parts[2]);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  if (y < 100) y = y <= 30 ? 2000 + y : 1900 + y;
  // Handle ambiguity: if m > 12, swap
  if (m > 12 && d <= 12) { [m, d] = [d, m]; }
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { lines, obra_social_id } = await req.json();

    if (!lines || !Array.isArray(lines)) {
      return new Response(JSON.stringify({ error: "lines array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Column order from OSPSIP padron:
    // 0: Nº Afiliado, 1: Orden, 2: Apellido, 3: Nombre, 4: Sexo,
    // 5: Fecha Nac., 6: Edad, 7: Estado Civil, 8: Tipo Doc., 9: Nro. Doc.,
    // 10: CUIL, 11: Nacionalidad, 12: Domicilio, 13: Localidad, 14: Provincia,
    // 15: Codigo Postal, 16: Parentesco, 17: CUIT Titular, 18: CUIT Empleador,
    // 19: Tipo Relación Laboral, 20: Discapacitado, 21: Plan, 22: Fecha Inicio Prestaciones

    let created = 0;
    let updated = 0;
    const errors: { line: number; error: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Parse pipe-delimited line (remove leading/trailing pipes)
      const cols = line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c: string) => c.trim());
      
      if (cols.length < 15) {
        errors.push({ line: i, error: "insufficient columns" });
        continue;
      }

      const dni = cols[9];
      if (!dni || dni === "Nro. Doc.") continue; // skip header

      const apellido = cols[2] || "";
      const nombre = cols[3] || "";
      const sexo = cols[4] || "";
      const fechaNac = parseDateMDY(cols[5]);
      const estadoCivil = cols[7] || "";
      const cuil = cols[10] || "";
      const nacionalidad = cols[11] || "";
      const direccion = cols[12] || "";
      const localidad = cols[13] || "";
      const provincia = cols[14] || "";
      const parentesco = cols[16] || "";
      const cuitTitular = cols[17] || "";
      const numeroAfiliado = cols[0] || "";
      const plan = cols[21] || "";

      // Normalize plan
      let planNorm = plan;
      if (plan) {
        const pu = plan.toUpperCase().replace(/[\s.]/g, "");
        if (pu.includes("SD")) planNorm = "PMO SD";
        else if (pu.includes("MT")) planNorm = "PMO MT";
        else if (pu.includes("PMO") || pu.includes("COMUN") || pu.includes("GENERAL")) planNorm = "PMO";
        else if (pu.includes("DOMESTICO")) planNorm = "Servicio Domestico";
        else if (pu.includes("MONOTRIB")) planNorm = "Monotributista";
      }

      const patientData = {
        dni,
        nombre,
        apellido,
        apellido_y_nombre: `${apellido}, ${nombre}`,
        sexo: sexo === "M" ? "M" : sexo === "F" ? "F" : sexo,
        fecha_nacimiento: fechaNac,
        estado_civil: estadoCivil,
        tipo_doc: "DNI",
        nro_doc: dni,
        cuil_beneficiario: cuil,
        nacionalidad,
        direccion,
        localidad,
        provincia,
        parentesco,
        cuil_titular: cuitTitular,
        numero_afiliado: numeroAfiliado,
        plan: planNorm || null,
        obra_social_id: obra_social_id,
        consultas_maximas: 999,
        activo: true,
      };

      try {
        // Check if patient exists by DNI
        const { data: existing } = await supabase
          .from("pacientes")
          .select("id")
          .eq("dni", dni)
          .eq("activo", true)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("pacientes")
            .update({ ...patientData, updated_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (error) throw error;
          updated++;
        } else {
          const { error } = await supabase.from("pacientes").insert(patientData);
          if (error) throw error;
          created++;
        }
      } catch (err: any) {
        errors.push({ line: i, error: `DNI ${dni}: ${err.message}` });
      }
    }

    return new Response(
      JSON.stringify({ created, updated, errors: errors.slice(0, 50), totalErrors: errors.length, total: lines.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
