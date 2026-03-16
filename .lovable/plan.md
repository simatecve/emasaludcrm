

## Plan: Switch de activar/desactivar usuarios + Fix visibilidad admin en autorizaciones

### Problema 1: Falta switch de activar/desactivar en la tabla de usuarios
Actualmente la tabla de usuarios muestra un Badge de estado pero no permite cambiar el estado directamente. Se necesita un Switch inline.

### Problema 2: Admin no ve autorizaciones
La politica RLS y el rol admin estan correctamente configurados en la base de datos (verificado: `has_role` retorna `true` para el admin). El problema puede ser de sesion o cache del cliente. Agregaremos un mecanismo de verificacion y nos aseguraremos de que el flujo de autenticacion bloquee usuarios inactivos.

---

### Cambios a realizar

#### 1. Agregar Switch de activar/desactivar en UserManagement.tsx
- Reemplazar el Badge de estado por un componente `Switch` de Radix UI
- Al togglear, llamar a `useUpdateUser` para cambiar `is_active`
- Mostrar feedback visual inmediato

#### 2. Bloquear login de usuarios inactivos
- En `Login.tsx` o `Index.tsx`, despues de autenticarse, verificar si `is_active === false` en la tabla `users`
- Si esta inactivo, cerrar sesion automaticamente y mostrar mensaje "Su cuenta ha sido desactivada"

#### 3. Verificar visibilidad admin en autorizaciones
- Agregar log de debug temporal en `useAutorizaciones` para verificar que la query no tenga errores silenciosos
- Asegurar que el hook no filtre datos del lado del cliente innecesariamente

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/UserManagement.tsx` | Agregar Switch para toggle de is_active |
| `src/pages/Index.tsx` | Agregar verificacion de is_active post-login, redirigir si inactivo |
| `src/hooks/useAutorizaciones.tsx` | Agregar manejo de error mejorado para debug |

