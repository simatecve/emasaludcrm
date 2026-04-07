import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { patients, soft_delete_all, deactivate_emasalud, reactivate_ospiv } = await req.json();

    const results = { soft_deleted: 0, created: 0, updated: 0, errors: [] as string[] };

    if (soft_delete_all) {
      const { data, error } = await supabase.from("pacientes").update({ activo: false }).eq("activo", true).select("id");
      if (error) results.errors.push("soft_delete: " + error.message);
      else results.soft_deleted = data?.length || 0;
    }

    if (deactivate_emasalud) {
      await supabase.from("obras_sociales").update({ activa: false }).eq("id", 15);
    }

    if (reactivate_ospiv) {
      await supabase.from("obras_sociales").update({ activa: true }).eq("id", 13);
    }

    if (patients && Array.isArray(patients)) {
      for (const p of patients) {
        try {
          const { data: existing } = await supabase
            .from("pacientes")
            .select("id")
            .eq("dni", p.dni)
            .eq("obra_social_id", p.obra_social_id)
            .limit(1);

          if (existing && existing.length > 0) {
            const { error } = await supabase.from("pacientes").update(p).eq("id", existing[0].id);
            if (error) results.errors.push(`UPDATE ${p.dni}: ${error.message}`);
            else results.updated++;
          } else {
            const { error } = await supabase.from("pacientes").insert(p);
            if (error) results.errors.push(`INSERT ${p.dni}: ${error.message}`);
            else results.created++;
          }
        } catch (e) {
          results.errors.push(`${p.dni}: ${e.message}`);
        }
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
