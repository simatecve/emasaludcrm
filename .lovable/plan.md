

## Plan: Recetario PDF — Formato institucional para todas las obras sociales

### Resumen
Reemplazar el template genérico (`generarRecetarioGenerico`) en `RecetarioPDF.tsx` para que **todas las obras sociales** usen el mismo formato institucional tipo formulario administrativo A4 que se muestra en la imagen de referencia (actualmente solo OSPSIP lo usa). Se mantendrá un único formato universal.

### Cambios

**1. Modificar `src/components/RecetarioPDF.tsx`**

- Eliminar `generarRecetarioGenerico` y `generarRecetarioOSPSIP` como funciones separadas.
- Crear una única función `generarRecetarioPDF` que genere el formulario institucional idéntico a la imagen para **todas** las obras sociales.
- Los datos dinámicos del paciente (nombre, apellido, DNI, número afiliado) y obra social se inyectan desde la BD.
- Los demás campos (diagnóstico, síntomas, medicamentos, dosis, descuentos, etc.) quedan vacíos para ser completados a mano tras imprimir.
- El header institucional adapta el nombre de la obra social dinámicamente (no solo "OSPSIP").
- La fecha de emisión se auto-completa con la fecha actual.
- El DNI del titular se auto-completa.

**Estructura del PDF (jsPDF):**
1. Encabezado centrado con nombre de obra social + "HISTORIA CLINICA" + subtítulos
2. Bloque derecho: RNOS, direcciones, teléfono (datos fijos institucionales)
3. Datos del beneficiario: nombre, diagnóstico, fecha emisión, N° obra social, N° sindical, edad, síntomas
4. Tabla de medicamentos (6 columnas, 2 filas genéricos)
5. Dosis diaria genérico 1 y 2
6. Sección "COMPLETAR LO QUE CORRESPONDA" con tabla diagnóstico/embarazo/firma
7. Fecha de venta / Farmacia
8. Tabla de descuentos (OSPSIP/UPSRA)
9. DNI titular, DNI quien retira, domicilio, teléfono, firma
10. Footer con nombre de obra social

**2. Ajustar `RecetarioManagement.tsx`** — Sin cambios necesarios, ya llama `generarRecetarioPDF` que será la función actualizada.

### Datos desde BD vs datos manuales

| Campo | Fuente |
|-------|--------|
| Nombre y apellido beneficiario | BD (paciente) |
| DNI del titular | BD (paciente) |
| Fecha de emisión | Auto (fecha actual) |
| Obra social (header/footer) | BD (obra social) |
| N° afiliado | BD (paciente) |
| Diagnóstico, síntomas, medicamentos, dosis, descuentos, firma | Vacíos (llenar a mano) |

### Archivos afectados
- `src/components/RecetarioPDF.tsx` — reescribir con formato único institucional

