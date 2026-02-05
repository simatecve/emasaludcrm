

## Plan: Historial Unificado de Paciente en Reportes

### Objetivo
Agregar una nueva pestaña "Historial Paciente" en la sección de Reportes que muestre toda la actividad de un paciente seleccionado: consultas, turnos y autorizaciones en una vista cronológica unificada.

### Estado Actual
- La sección de Reportes tiene pestañas separadas: Consultas, Turnos, Autorizaciones, Médicos, Obras Sociales, Ingresos
- Ya existe un selector de paciente en los filtros generales
- Los hooks de reportes (`useConsultasReport`, `useTurnosReport`, `useAutorizacionesReport`) ya filtran por `pacienteId`

### Cambios a Realizar

#### 1. Modificar ReportsManagement.tsx

**Agregar nueva pestaña "Historial Paciente":**

| Elemento | Cambio |
|----------|--------|
| TabsList | Agregar `<TabsTrigger value="historial">Historial Paciente</TabsTrigger>` |
| TabsContent | Agregar nueva sección con vista unificada |

**Contenido de la nueva pestaña:**

```text
+------------------------------------------+
|  FICHA DEL PACIENTE (si hay uno selec.)  |
|  +--------------------------------------+|
|  | Nombre: Juan Pérez    DNI: 12345678 ||
|  | Obra Social: OSPIV    Plan: PMO     ||
|  | Teléfono: 2612345678  Email: ...    ||
|  +--------------------------------------+|
+------------------------------------------+
|  LÍNEA TEMPORAL DE ACTIVIDAD             |
|  +--------------------------------------+|
|  | 25/01/2025 | CONSULTA  | Control... ||
|  | 20/01/2025 | AUTORIZACIÓN | Estudio ||
|  | 15/01/2025 | TURNO | Cardiología    ||
|  | ...                                   ||
|  +--------------------------------------+|
+------------------------------------------+
```

**Lógica de la vista unificada:**

1. Combinar datos de los 3 hooks existentes en un solo array
2. Agregar un campo `tipo` a cada registro (Consulta/Turno/Autorización)
3. Ordenar por fecha descendente
4. Mostrar en una tabla con columnas: Fecha, Tipo, Detalle, Estado/Médico

**Mostrar mensaje si no hay paciente seleccionado:**
- Si `filters.pacienteId` está vacío, mostrar un mensaje indicando que debe seleccionar un paciente

#### 2. Estructura de la Vista

**Ficha del Paciente (Card superior):**
- Nombre completo y DNI
- Obra Social y Plan
- Teléfono y Email
- Localidad/Provincia

**Tabla de Historial:**

| Fecha | Tipo | Detalle | Estado/Info |
|-------|------|---------|-------------|
| 25/01/2025 | Consulta | Motivo: Control anual - Dx: Normal | Dr. García |
| 20/01/2025 | Autorización | Ecografía (N° 2025-001) | Aprobada |
| 15/01/2025 | Turno | Cardiología - 10:30 hs | Completado |

**Badges de colores por tipo:**
- Consulta: azul
- Turno: verde
- Autorización: naranja

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| src/components/ReportsManagement.tsx | Agregar pestaña "Historial Paciente" con vista unificada |

### Detalles Técnicos

1. Usar los hooks existentes que ya filtran por `pacienteId`:
   - `useConsultasReport(filters)` - ya implementado
   - `useTurnosReport(filters)` - ya implementado
   - `useAutorizacionesReport(filters)` - ya implementado

2. Buscar el paciente seleccionado en el array `pacientes` para mostrar sus datos completos en la ficha

3. Crear función helper para combinar y ordenar los registros:
```typescript
const combinePatientHistory = () => {
  const history = [];
  // Agregar consultas con tipo 'consulta'
  // Agregar turnos con tipo 'turno'
  // Agregar autorizaciones con tipo 'autorizacion'
  // Ordenar por fecha descendente
  return history;
};
```

4. Agregar botones de exportar CSV/PDF con todos los datos del historial

### Resultado Visual

Cuando el usuario seleccione un paciente en el filtro y vaya a la pestaña "Historial Paciente":
- Verá la ficha completa del paciente en la parte superior
- Debajo, una tabla cronológica con TODA su actividad en el sistema
- Podrá exportar el historial completo a CSV o PDF

