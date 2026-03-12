import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseDateMDY(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  let p0 = parseInt(parts[0]);
  let p1 = parseInt(parts[1]);
  let y = parseInt(parts[2]);
  if (isNaN(p0) || isNaN(p1) || isNaN(y)) return null;
  if (y < 100) y = y <= 30 ? 2000 + y : 1900 + y;
  
  let m: number, d: number;
  if (p0 > 12) { d = p0; m = p1; }
  else if (p1 > 12) { m = p0; d = p1; }
  else { m = p0; d = p1; } // default M/D/Y
  
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function processRow(cols: string[], obra_social_id: number) {
  const dni = cols[9]?.trim();
  if (!dni || dni === "Nro. Doc." || !dni.match(/^\d+$/)) return null;

  const apellido = cols[2]?.trim() || "";
  const nombre = cols[3]?.trim() || "";
  const sexo = cols[4]?.trim() || "";
  const fechaNac = parseDateMDY(cols[5]?.trim() || "");
  const estadoCivil = cols[7]?.trim() || "";
  const cuil = cols[10]?.trim() || "";
  const nacionalidad = cols[11]?.trim() || "";
  const direccion = cols[12]?.trim() || "";
  const localidad = cols[13]?.trim() || "";
  const provincia = cols[14]?.trim() || "";
  const parentesco = cols[16]?.trim() || "";
  const cuitTitular = cols[17]?.trim() || "";
  const numeroAfiliado = cols[0]?.trim() || "";
  const plan = cols[21]?.trim() || "";

  let planNorm = plan;
  if (plan) {
    const pu = plan.toUpperCase().replace(/[\s.]/g, "");
    if (pu.includes("SD")) planNorm = "PMO SD";
    else if (pu.includes("MT")) planNorm = "PMO MT";
    else if (pu.includes("PMO") || pu.includes("COMUN") || pu.includes("GENERAL")) planNorm = "PMO";
    else if (pu.includes("DOMESTICO")) planNorm = "Servicio Domestico";
    else if (pu.includes("MONOTRIB")) planNorm = "Monotributista";
  }

  return {
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
    obra_social_id,
    consultas_maximas: 999,
    activo: true,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const obra_social_id = body.obra_social_id || 7;
    
    let rows: string[][] = [];

    if (body.file_base64) {
      // Parse XLS from base64
      const binary = atob(body.file_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const workbook = XLSX.read(bytes, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as string[][];
      rows = data.slice(1); // skip header
    } else if (body.lines && Array.isArray(body.lines)) {
      // Parse pipe-delimited lines
      rows = body.lines.map((line: string) => 
        line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c: string) => c.trim())
      );
    } else {
      return new Response(JSON.stringify({ error: "file_base64 or lines required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let created = 0;
    let updated = 0;
    const errors: { line: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const patientData = processRow(rows[i], obra_social_id);
      if (!patientData) continue;

      try {
        const { data: existing } = await supabase
          .from("pacientes")
          .select("id")
          .eq("dni", patientData.dni)
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
        errors.push({ line: i, error: `DNI ${patientData.dni}: ${err.message}` });
      }
    }

    return new Response(
      JSON.stringify({ created, updated, errors: errors.slice(0, 50), totalErrors: errors.length, total: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
