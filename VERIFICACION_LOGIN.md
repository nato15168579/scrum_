# ✅ VERIFICACIÓN DEL FLUJO DE LOGIN

## 🎯 Cambios Realizados

### 1. **Frontend - LoginScreen.tsx**
- ✅ Ruta corregida: `/dashboard` → `/dashboard-instructor` (para instructores)
- ✅ Logging mejorado con emojis para fácil seguimiento
- ✅ Validación completa de datos recibidos del servidor
- ✅ Guardado de localStorage: `userCedula`, `userRoleId`, `userName`

### 2. **Frontend - App.tsx**
- ✅ Ruta actualizada: `/dashboard-instructor` (era `/dashboard`)
- ✅ Ruta estudiante: `/student-dashboard`

### 3. **Frontend - StudentDashboard.tsx**
- ✅ Hook `useAuthValidation()` corregido
- ✅ Ahora valida `userCedula` y `userRoleId` (no requiere `userToken`)
- ✅ Logging mejorado para debugging

### 4. **Backend - login.service.ts**
- ✅ Logging detallado agregado para rastrear el flujo
- ✅ Verifica que `rolSisIdFk` se devuelva correctamente

---

## 🔍 PASOS DE VERIFICACIÓN

### PASO 1: Verificar Base de Datos
**Ejecutar en MySQL:**
```sql
-- Verificar que existe un usuario de prueba
SELECT usuCedula, usuNombres, usuApellidos, usuContrasena, rolSisIdFk 
FROM usuario 
WHERE usuCedula = [TU_CEDULA_PRUEBA];

-- Verificar que hay instructores (rol = 2) y aprendices (otros roles)
SELECT DISTINCT rolSisIdFk FROM usuario;

-- Ver todos los roles del sistema
SELECT * FROM rol_sistema;
```

**Requisitos:**
- ✅ El usuario existe en la BD
- ✅ `usuContrasena` comienza con `$2b$` (indica bcrypt)
- ✅ `rolSisIdFk` tiene un valor numérico (2 para instructor)

---

### PASO 2: Copiar Logs del Backend
**Al iniciar sesión, el backend debe mostrar:**
```
🔍 [LoginService] Buscando usuario con cédula: 1234567890
✅ [LoginService] Usuario encontrado: { usuCedula, usuNombres, rolSisIdFk }
✅ [LoginService] Contraseña válida
📤 [LoginService] Devolviendo datos del usuario: {...}
```

**Problema común:**
- ❌ Si ves `Usuario no encontrado` → la cédula no existe en BD
- ❌ Si ves `Contraseña incorrecta` → la contraseña hasheada en BD es incorrecta

---

### PASO 3: Abrir DevTools del Navegador (F12)
**En Console, encontrarás:**

**Esperado para Instructor (rol=2):**
```
✅ Datos recibidos del servidor: {usuCedula, usuNombres, roleIdStr: "2", ...}
📋 Datos parseados: {cedulaStr, roleIdStr: "2", ...}
✅ Datos guardados en localStorage
🔍 ID de rol numérico: 2
🎯 Rol es Instructor (2) - Redirigiendo a /dashboard-instructor
```

**Esperado para Aprendiz (rol≠2):**
```
✅ Datos recibidos del servidor: {usuCedula, usuNombres, roleIdStr: "3", ...}
📋 Datos parseados: {cedulaStr, roleIdStr: "3", ...}
✅ Datos guardados en localStorage
🔍 ID de rol numérico: 3
🎯 Rol es Aprendiz - Redirigiendo a /student-dashboard
```

**Problema común:**
- ❌ Si no ves `✅ Datos recibidos...` → error en conexión backend
- ❌ Si ves `roleIdStr: ""` o `undefined` → backend no devuelve `rolSisIdFk`

---

### PASO 4: Verificar localStorage
**En DevTools → Application → Local Storage:**
- ✅ `userCedula` = nuestra cédula
- ✅ `userRoleId` = "2" o "3" (etc)
- ✅ `userName` = nuestro nombre completo

---

### PASO 5: Verificar Redirección
**Después de login:**
- ✅ **Instructor**: URL debe ser `http://localhost:5173/dashboard-instructor` (no `/dashboard`)
- ✅ **Aprendiz**: URL debe ser `http://localhost:5173/student-dashboard`
- ✅ Dashboard debe cargar sin redirigir inmediatamente

---

## 🐛 TROUBLESHOOTING

### Problema: "Documento o contraseña son incorrectos"
**Solución:**
```bash
# 1. Verificar DB
SELECT usuCedula, usuContrasena FROM usuario LIMIT 1;

# 2. Si la contraseña NO comienza con $2b$, ejecutar:
# (En el backend, llamar a http://localhost:5000/auth/fix-passwords en Postman)

# 3. O actualizar manualmente en MySQL:
UPDATE usuario SET usuContrasena = '[bcrypt_hash]' WHERE usuCedula = [cedula];
```

### Problema: Login funciona pero no redirige
**Verificar:**
1. Abrir DevTools Console
2. Buscar: `🎯 Rol es...` 
3. Si NO aparece:
   - Backend no devuelve `rolSisIdFk`
   - Revisar logs del backend
4. Si aparece pero no redirige:
   - Verificar que las rutas existen en App.tsx
   - Revisar Console por errores de React Router

### Problema: Redirige pero luego redirije a login
**Causa:** StudentDashboard valida auth y falla
**Solución:**
1. Verificar localStorage tiene `userCedula` y `userRoleId`
2. Abrir DevTools de StudentDashboard
3. Buscar: `Validando auth:`
4. Si falla, localStorage fue borrado (problema de rutas)

---

## 📊 DIAGRAMA DEL FLUJO

```
┌─────────────────┐
│   LoginScreen   │
│    (Cédula)     │
└────────┬────────┘
         │
         └──→ Backend: POST /auth/login
                 │
                 ├─→ ValidarUsuario (service)
                 │   ├─ Buscar usuario
                 │   ├─ Verificar bcrypt
                 │   └─ Devolver {usuCedula, rolSisIdFk, ...}
                 │
                 └──→ Frontend: Respuesta JSON
                     │
                     ├─→ Guardar localStorage
                     │
                     ├─→ Validar rolSisIdFk
                     │
                     └─→ Redirigir:
                         ├─ rol=2: /dashboard-instructor
                         └─ rol≠2: /student-dashboard
                             │
                             └──→ Dashboard
                                 ├─ Validar localStorage
                                 └─ Cargar datos
```

---

## ✅ PRÓXIMOS PASOS

1. **Ejecutar en Terminal Backend:**
   ```bash
   cd backend
   npm run start:dev
   # Observar logs cuando hagas login
   ```

2. **Ejecutar en Terminal Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Hacer login exactamente con estos pasos:**
   - Abrir `http://localhost:5173/`
   - F12 para DevTools
   - Ir a Console
   - Ingresar cédula del usuario test
   - Ingresar contraseña correcta
   - Observar todos los logs con ✅ o ❌

4. **Si algo falla:**
   - Copiar ERROR de Console
   - Copiar ERROR de terminal backend
   - Verificar base de datos
   - Revisar este documento

