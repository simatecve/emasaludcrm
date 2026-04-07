

## Fix: Fechas un día atrás en Facturación

### Problema
Cuando Supabase devuelve fechas como `"2026-04-07"` (solo fecha, sin hora), `new Date("2026-04-07")` las interpreta como UTC medianoche. En Argentina (UTC-3), eso se convierte en `2026-04-06 21:00`, mostrando el día anterior.

### Solución
Crear una función helper `parseLocalDate(dateStr)` que agrega `T00:00:00` para forzar interpretación en zona local, y usarla en todos los `format(new Date(...))` de los 3 archivos de facturación.

### Archivos a modificar

1. **`src/lib/utils.ts`** — Agregar helper:
   ```ts
   export function parseLocalDate(dateStr: string): Date {
     if (dateStr.length === 10) return new Date(dateStr + 'T00:00:00');
     return new Date(dateStr);
   }
   ```

2. **`src/components/facturacion/FacturacionObraSocial.tsx`** — Reemplazar `new Date(a.fecha_solicitud)` por `parseLocalDate(a.fecha_solicitud)`

3. **`src/components/facturacion/LotesHistorial.tsx`** — Reemplazar `new Date(l.fecha_desde)` y `new Date(l.fecha_hasta)` por `parseLocalDate(...)`

4. **`src/components/facturacion/FacturacionParticular.tsx`** — Reemplazar `new Date(a.fecha_solicitud)`, `new Date(c.fecha_emision)`, `new Date(c.fecha_pago)` por `parseLocalDate(...)`

Total: 4 archivos, ~8 reemplazos puntuales.

