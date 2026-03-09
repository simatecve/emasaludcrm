

## Plan: Mejoras en Obras Sociales, Performance y PDF de Autorizaciones

### 1. Auto-desactivar pacientes al desactivar una obra social

**Problema**: Al desactivar una obra social hay que ir manualmente a pacientes a eliminarlos.

**Solución**: Modificar `handleToggleActive` en `ObraSocialManagement.tsx` para que al desactivar una obra social, automáticamente marque `activo = false` a todos los pacientes asociados. Al reactivar, restaurar los pacientes.

**Archivo**: `src/components/ObraSocialManagement.tsx`
- Importar `useUpdatePatient` o usar supabase directamente en el handler
- Agregar lógica: si se desactiva → `UPDATE pacientes SET activo = false WHERE obra_social_id = X`
- Si se reactiva → `UPDATE pacientes SET activo = true WHERE obra_social_id = X`
- Mostrar toast con cantidad de pacientes afectados
- Invalidar query cache de `['patients']`

---

### 2. Optimizar rendimiento de autorizaciones y dashboard

**Problema**: `useAutorizaciones` hace N+1 queries (una query por cada autorización para obtener prestaciones). El dashboard hace múltiples queries secuenciales.

**Soluciones**:

**Archivo**: `src/hooks/useAutorizaciones.tsx`
- Reemplazar el `Promise.all` con N queries individuales por una sola query batch:
  - Obtener todos los IDs de autorizaciones
  - Hacer UNA query a `autorizacion_prestaciones` con `.in('autorizacion_id', ids)`
  - Mapear prestaciones a cada autorización en memoria

**Archivo**: `src/hooks/useDashboardStats.tsx`
- Ejecutar las 4 queries en paralelo con `Promise.all` en lugar de secuencialmente
- Usar `{ count: 'exact', head: true }` donde solo se necesita el conteo (pacientes, autorizaciones pendientes)

**Archivo**: `src/hooks/useObrasSocialesStats.tsx`
- Ejecutar queries en paralelo con `Promise.all`

---

### 3. Corregir PDF de autorizaciones - datos faltantes

**Problema**: Falta el código de prestación visible y la información del médico que realiza la práctica.

**Archivo**: `src/components/AutorizacionPDF.tsx`
- Agregar fila con datos del médico (nombre, apellido, matrícula) usando `autorizacion.medicos`
- El código de prestación ya se muestra en la tabla (columna "Cod"), pero verificar que se renderiza correctamente
- Agregar columna o fila visible con el médico que realiza la práctica
- Incluir fecha de solicitud y fecha de vencimiento en el encabezado del PDF

**Archivo**: `src/hooks/useAutorizaciones.tsx`
- Verificar que la query ya trae `medicos (nombre, apellido, matricula)` — ya lo hace

---

### Resumen de archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ObraSocialManagement.tsx` | Auto-desactivar/reactivar pacientes al togglear obra social |
| `src/hooks/useAutorizaciones.tsx` | Eliminar N+1 queries, usar batch query |
| `src/hooks/useDashboardStats.tsx` | Paralelizar queries + usar count head |
| `src/hooks/useObrasSocialesStats.tsx` | Paralelizar queries |
| `src/components/AutorizacionPDF.tsx` | Agregar datos del médico, fechas, y mejorar visibilidad del código |

