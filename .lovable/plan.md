

## Plan: Restringir Clínicas CEAC, CIMYN y Sanatorio Mayo a Solo Consultas (420101)

### Objetivo
Que los perfiles de prestador de CEAC, CIMYN y Sanatorio de Mayo solo puedan emitir autorizaciones de tipo "consulta" con el codigo de prestacion 420101 (consulta diurna). No deben poder elegir otros tipos de autorizacion ni otras prestaciones.

### Usuarios Afectados

| Clinica | Email | Username |
|---------|-------|----------|
| CEAC | ceac@ema.com | CEAAC |
| CIMYN | cimyn@ema-salud.com | CIMYN |
| Sanatorio de Mayo | sanatoriodemayo@ema.com | Sanatorio de mayo |

### Cambios a Realizar

#### 1. Crear lista de prestadores restringidos

Definir una constante con los emails de los prestadores que solo pueden emitir consultas. Esto se usara para verificar si el usuario logueado es uno de estos prestadores.

#### 2. Modificar AutorizacionManagement.tsx

- Cuando el usuario es un prestador restringido, el formulario que se abre pre-carga automaticamente:
  - **Tipo de autorizacion**: "consulta" (bloqueado, no editable)
  - **Prestacion**: codigo 420101 - "consulta diurna" (bloqueado, no editable)
- Se ocultan los campos de busqueda de prestacion y selector de tipo, mostrando solo los valores fijos

#### 3. Modificar SimplePrestadorAutorizacionForm.tsx

Este es el formulario que usan los prestadores. Los cambios:

- Detectar si el `currentUser` es un prestador restringido (por email)
- Si es restringido:
  - Pre-cargar `tipo_autorizacion = "consulta"` y hacerlo no editable
  - Pre-cargar `prestacion_codigo = "420101"` y `prestacion_descripcion = "consulta diurna"` y hacerlos no editables
  - Ocultar el buscador de prestaciones y mostrar los valores fijos
  - Ocultar el selector de tipo de autorizacion y mostrar "Consulta" como texto fijo

### Detalle Tecnico

**Constante de prestadores restringidos:**
```text
RESTRICTED_PRESTADOR_EMAILS = [
  'ceac@ema.com',
  'cimyn@ema-salud.com',
  'sanatoriodemayo@ema.com'
]
```

**Logica en SimplePrestadorAutorizacionForm:**
- Comparar `currentUser.email` contra la lista
- Si coincide: valores fijos, campos deshabilitados
- Si no coincide: comportamiento actual sin cambios

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| src/components/SimplePrestadorAutorizacionForm.tsx | Detectar prestador restringido, bloquear tipo y prestacion a "consulta" / 420101 |
| src/components/AutorizacionManagement.tsx | Pasar la restriccion al formulario cuando aplique |

### Resultado

Cuando CEAC, CIMYN o Sanatorio de Mayo inicien sesion y creen una autorizacion:
- El tipo sera siempre "consulta" sin opcion de cambiarlo
- La prestacion sera siempre "420101 - consulta diurna" sin opcion de buscar otra
- Solo deben completar: paciente, obra social, medico y observaciones
