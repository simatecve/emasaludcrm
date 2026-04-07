

## Plan: Cambios masivos — Pacientes, Obras Sociales, Nomenclador, Autorizaciones y Credenciales

### Resumen
Se requieren 5 grandes bloques de cambios: recargar pacientes desde padrones, eliminar Ema Salud, mejorar nomenclador, rediseñar flujo de autorizaciones con topes y BDA/FDP, y restringir credenciales.

---

### 1. Eliminar pacientes y recargar desde padrones

**Datos actuales**: 3463 activos + 1079 inactivos = 4542 pacientes.  
**Archivos subidos** (5 padrones):
- OSPSIP: ~400 registros (obra_social_id = 7)
- OSCE: ~144 registros (obra_social_id = 9)
- OSCEARA: ~107 registros (obra_social_id = 8)
- OSPIV: ~61 registros (obra_social_id = 13, actualmente inactiva — reactivar)
- OSPE: ~1169 registros (obra_social_id = 14)

**Acciones**:
- Migración SQL: `UPDATE pacientes SET activo = false` (soft-delete todos)
- Script Python: parsear cada Excel, mapear columnas (cada padrón tiene formato diferente), e insertar/actualizar pacientes vía Supabase API
- Mapeo de columnas por padrón:
  - **OSPSIP**: Nro.Doc → dni, Apellido → apellido, Nombre → nombre, Fecha Nac → fecha_nacimiento, Sexo, CUIL, Parentesco, Localidad, Provincia, Plan, Nº Afiliado
  - **OSCE**: Nro Documento → dni, Nombre (APELLIDO, NOMBRE) → split, CUIL, Parentezco, Sexo, Localidad, Provincia, Cobertura → estado_padron
  - **OSCEARA**: CUIL → extract DNI, Apellido y Nombre → split, Parentesco, Sexo, Plan, Localidad, Provincia, Motivo Alta/Baja → estado_padron
  - **OSPIV**: Documento → dni, Nombre del afiliado → split, Credencial → numero_afiliado, Sexo, Provincia, Fecha de Nacimiento
  - **OSPE**: NUM_DOC → dni, NOMBRE → split, CUIL, PARENTESCO, SEXO, PLANDESC → plan, LOCALID, PCIA

**Base de datos**: Agregar columna `estado_padron` a `pacientes` para almacenar BDA/FDP/Activo (migración).

---

### 2. Eliminar obra social EMASALUD

**Estado actual**: EMASALUD (id=15) con 145 pacientes asociados.  
Ema Salud es una gerenciadora, no una obra social. Los pacientes de OSCE y OSCEARA vienen a través de Ema Salud.

**Acciones**:
- Reasignar pacientes de obra_social_id=15 a OSCE (id=9) u OSCEARA (id=8) según coincidencia de DNI con los padrones
- Desactivar EMASALUD: `UPDATE obras_sociales SET activa = false WHERE id = 15`
- Reactivar OSPIV: `UPDATE obras_sociales SET activa = true WHERE id = 13`

---

### 3. Nomenclador: opción eliminar todos y subir nuevos

**Cambios en `NomecladorManagement.tsx`**:
- Agregar botón "Eliminar Todo" con confirmación de doble paso (dialog con texto "ELIMINAR" para confirmar)
- Agregar funcionalidad de importación masiva desde Excel/CSV
- Nuevo hook `useDeleteAllNomeclador` que ejecuta `DELETE FROM nomeclador` (necesita migración para permitir DELETE masivo o usar el hook existente en loop)

**Cambios en `useNomecladorCrud.tsx`**:
- Agregar mutación `useDeleteAllNomeclador`

---

### 4. Autorizaciones: nuevo flujo con búsqueda de paciente, topes y BDA/FDP

**Flujo actual**: Se abre un dialog con formulario donde se selecciona paciente.  
**Flujo nuevo**: 
1. Al entrar a Autorizaciones, se muestra primero un buscador de paciente (por DNI o nombre)
2. Al encontrar al paciente, se muestra un panel con:
   - Nombre, DNI, Obra Social
   - **Topes mensuales**: consultas_mes_actual / consultas_maximas
   - **Estado padrón**: BDA / FDP / Activo (nueva columna `estado_padron`)
   - Si está BDA o FDP: alerta roja bloqueando la creación
3. Botón "Nueva Autorización" abre el formulario con el paciente ya cargado
4. Al crear autorización, incrementar `consultas_mes_actual` y validar contra `consultas_maximas`

**Cambios**:
- `AutorizacionManagement.tsx`: Rediseñar con estado `selectedPatient` como primer paso, mostrar info del paciente con topes y estado_padron
- `AutorizacionForm.tsx`: Recibir paciente pre-seleccionado, deshabilitar selector si viene pre-cargado
- `useAutorizaciones.tsx`: Agregar validación de topes al crear autorización (incrementar `consultas_mes_actual`)
- Migración: Agregar columna `estado_padron TEXT` a tabla `pacientes`

**Topes**: El campo `consultas_maximas` ya existe. Se debe validar `consultas_mes_actual < consultas_maximas` antes de crear una autorización. Si se supera, mostrar error.

---

### 5. Credenciales: solo pacientes del padrón

**Estado actual**: La página pública `/credencial` busca por DNI en `pacientes` donde `activo = true`. Si existe, genera credencial.  
**Esto ya funciona correctamente** — solo pacientes cargados en la BD (del padrón) pueden obtener credencial. El edge function `public-credencial` ya valida `activo = true`.

Si el usuario se refiere a que cualquiera puede inventar un DNI y si coincide con uno activo obtiene credencial, eso es el comportamiento esperado (es una consulta pública por DNI, similar a consultar un padrón).

No se requieren cambios adicionales salvo confirmar que el comportamiento es el deseado.

---

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| Migración SQL | Agregar `estado_padron` a `pacientes`, soft-delete masivo |
| Script Python (temporal) | Parsear 5 padrones e insertar pacientes |
| `src/components/NomecladorManagement.tsx` | Botón eliminar todo + importar |
| `src/hooks/useNomecladorCrud.tsx` | Hook deleteAll |
| `src/components/AutorizacionManagement.tsx` | Rediseñar con búsqueda de paciente primero |
| `src/components/AutorizacionForm.tsx` | Aceptar paciente pre-seleccionado |
| `src/hooks/useAutorizaciones.tsx` | Validar topes al crear |

### Orden de ejecución
1. Migración BD (agregar `estado_padron`, soft-delete pacientes)
2. Gestión de obras sociales (desactivar EMASALUD, reactivar OSPIV)
3. Script de carga de padrones (5 archivos)
4. Nomenclador (UI de eliminar todo + importar)
5. Autorizaciones (nuevo flujo)

