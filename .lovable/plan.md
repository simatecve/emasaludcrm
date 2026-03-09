

## Plan: Módulo de Facturación basado en Autorizaciones

El sistema de facturación se construye sobre la tabla `autorizaciones` existente, sin crear tablas de estudios nuevas. Las autorizaciones aprobadas son la base para facturar.

### 1. Cambios en base de datos

**Agregar columnas a `autorizaciones`:**
- `estado_facturacion` text DEFAULT 'pendiente' (pendiente | facturado)
- `lote_facturacion_id` integer nullable

**Agregar columna a `autorizacion_prestaciones`:**
- `precio` numeric DEFAULT 0 (precio unitario de cada prestación)

**Nueva tabla `lotes_facturacion`:**
```text
id                  serial PK
obra_social_id      integer (ref obras_sociales, nullable)
fecha_desde         date NOT NULL
fecha_hasta         date NOT NULL
total               numeric NOT NULL DEFAULT 0
cantidad_estudios   integer NOT NULL DEFAULT 0
numero_lote         text NOT NULL
estado              text DEFAULT 'generado' (generado | enviado | cobrado)
observaciones       text
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

**Nueva tabla `comprobantes_particulares`:**
```text
id                  serial PK
autorizacion_id     integer NOT NULL (ref autorizaciones)
paciente_id         integer NOT NULL (ref pacientes)
monto               numeric NOT NULL
fecha_emision       date DEFAULT CURRENT_DATE
fecha_pago          date nullable
estado              text DEFAULT 'pendiente' (pendiente | pagado)
metodo_pago         text nullable
numero_comprobante  text NOT NULL
observaciones       text
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

RLS: admin y usuario_normal CRUD completo en ambas tablas nuevas. Lectura autenticada.

---

### 2. Nuevos archivos

| Archivo | Propósito |
|---------|-----------|
| `src/hooks/useFacturacion.tsx` | Queries para autorizaciones con filtros de facturación, mutaciones para marcar facturado, CRUD lotes y comprobantes |
| `src/components/FacturacionManagement.tsx` | Componente principal con 4 tabs |
| `src/components/facturacion/FacturacionObraSocial.tsx` | Filtrar autorizaciones aprobadas pendientes de facturar por OS/fechas, seleccionar, generar lote, exportar Excel/PDF |
| `src/components/facturacion/FacturacionParticular.tsx` | Autorizaciones sin OS, generar comprobante, registrar pago |
| `src/components/facturacion/LotesHistorial.tsx` | Historial de lotes generados con estado y export |
| `src/components/facturacion/FacturacionReports.tsx` | Reportes: total por mes, por OS, por tipo, pendientes (recharts) |

---

### 3. Flujo UI

**Tab "Facturación OS"**: Filtra autorizaciones aprobadas con `estado_facturacion = 'pendiente'` por obra social y rango de fechas. Checkboxes para seleccionar. Botón "Generar Lote" que:
- Crea registro en `lotes_facturacion`
- Actualiza `estado_facturacion = 'facturado'` y `lote_facturacion_id` en autorizaciones seleccionadas
- Calcula total sumando precios de prestaciones
- Permite exportar a Excel (xlsx) y PDF (jspdf-autotable)

**Tab "Particulares"**: Autorizaciones donde `obra_social_id IS NULL`. Generar comprobante, registrar pago con método y fecha.

**Tab "Lotes"**: Historial de lotes con filtros, detalle expandible, cambio de estado (generado → enviado → cobrado).

**Tab "Reportes"**: Gráficos con recharts — total facturado por mes (bar), por OS (pie), pendientes.

---

### 4. Archivos a modificar

- **`src/pages/Index.tsx`**: Agregar case `'facturacion'` → `<FacturacionManagement />`
- **`src/components/Sidebar.tsx`**: Agregar `{ id: 'facturacion', label: 'Facturación', icon: FileText }` en menús admin y usuario_normal

---

### 5. Resumen

Se reutilizan las autorizaciones existentes como base de facturación. Solo se agregan 2 columnas a tablas existentes y 2 tablas nuevas (lotes + comprobantes). El precio se registra en cada prestación de la autorización. La UI permite todo el flujo de facturación sin salir del sistema.

