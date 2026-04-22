

## Plan: Importar padrón OSPSIP San Juan Abril 2026 a `pacientes`

### Contexto
- Archivo: `padron_ospsip_san_juan_abril_2026_san_juan.xlsx`
- Obra social: **OSPSIP** (`obra_social_id = 7`)
- Mismo formato que importaciones anteriores (Nº Afiliado, Apellido, Nombre, Sexo, Fecha Nac, Tipo Doc, Nro Doc, CUIL, Domicilio, Localidad, Provincia, Parentesco, CUIT Titular, Plan)
- Edge function `import-padron-bulk` ya existe y hace upsert por DNI + obra_social_id

### Pasos

1. **Copiar archivo al sandbox** con `code--copy user-uploads://padron_ospsip_san_juan_abril_2026_san_juan.xlsx /tmp/`

2. **Script Python** (`pandas` + `openpyxl`):
   - Leer el Excel e inspeccionar columnas
   - Normalizar:
     - DNI: limpiar puntos/espacios
     - Sexo: 'M' / 'F'
     - Parentesco: Titular / Cónyuge / Hijo/a
     - Fecha de nacimiento: convertir serial/string → `YYYY-MM-DD`
     - Plan: normalizar a `PMO` / `PMO SD` / `PMO MT`
   - Setear: `obra_social_id: 7`, `activo: true`, `estado_padron: 'Activo'`, `consultas_maximas: 999`

3. **Enviar en batches de 50** vía POST a `https://cgtykkvyywmyfmtsjoyl.supabase.co/functions/v1/import-padron-bulk` con `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS, hace upsert automático por DNI + obra_social_id)

4. **Reportar resultados**: creados, actualizados, errores y total final de pacientes activos OSPSIP

### Detalle técnico
- Headers: `Authorization: Bearer <SERVICE_ROLE_KEY>`, `Content-Type: application/json`
- Body: `{ "patients": [...batch...] }`
- El edge function existente revisa `dni` + `obra_social_id`: si existe → UPDATE, si no → INSERT
- No requiere cambios de código ni migraciones — solo ejecución del script

