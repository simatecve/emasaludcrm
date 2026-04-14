

## Plan: Importar padrones OSPSIP y OSCEARA directamente a la base de datos

### Contexto
- **OSPSIP** (obra_social_id = 7): 418 activos de 1961 totales
- **OSCEARA** (obra_social_id = 8): 104 activos de 335 totales
- Ya existe el edge function `import-padron-bulk` que hace upsert por DNI + obra_social_id
- Ya existe lógica de parsing en `AutoImportPadron.tsx` para el formato OSPSIP

### Pasos

1. **Copiar ambos archivos al sandbox** y leerlos con Python (pandas/xlrd/openpyxl) para inspeccionar columnas y estructura de cada archivo

2. **Script Python para OSPSIP** (`Padrón_ospsip_08-04-2026_pcias..xlsx`):
   - Leer con pandas, mapear columnas al esquema `pacientes` usando la misma lógica que `AutoImportPadron.tsx` (columnas: Nº Afiliado, Apellido, Nombre, Sexo, Fecha Nac, Estado Civil, Tipo Doc, Nro Doc, CUIL, Nacionalidad, Domicilio, Localidad, Provincia, Parentesco, CUIT Titular, Plan)
   - `obra_social_id = 7`, `activo = true`, `consultas_maximas = 999`

3. **Script Python para OSCEARA** (`padron_OSCEARA04-26.xls`):
   - Leer con xlrd/pandas, inspeccionar columnas (puede tener formato diferente)
   - Mapear al esquema `pacientes` con `obra_social_id = 8`

4. **Enviar en batches de 200** al edge function `import-padron-bulk` vía HTTP POST con el service role key
   - El edge function ya maneja: si existe DNI + obra_social_id → update, si no → insert

5. **Reportar resultados** (creados/actualizados/errores por cada archivo)

### Detalle técnico
- Se usará `requests` + `pandas`/`openpyxl`/`xlrd` en Python
- Se invocará el endpoint: `https://cgtykkvyywmyfmtsjoyl.supabase.co/functions/v1/import-padron-bulk`
- Headers: `Authorization: Bearer <service_role_key>`, `Content-Type: application/json`
- Body: `{ "patients": [...batch de 200...] }`
- Se normalizan fechas (Excel serial → YYYY-MM-DD), planes, parentescos

