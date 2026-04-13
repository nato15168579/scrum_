//hola

# ⚡ GUÍA RÁPIDA: COMANDOS DE INICIO

## 🚀 INICIO EN 3 PASOS

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```
**Esperado:** Debería ver:
```
[Nest] 12345 - 01/01/2024 10:00:00  LOG [Nest Application Factory] Trying to find NestJS application module in the specified directory (/path/to/backend/src)
```

### Terminal 2: Frontend  
```bash
cd frontend
npm run dev
```
**Esperado:** Debería ver:
```
  ➜  Local:   http://localhost:5173/
```

### Terminal 3 (Navegador)
```
http://localhost:5173
```

---

## 🔍 VERIFICAR BASE DE DATOS

### MySQL Workbench o MySQL CLI:

```sql
-- Ver usuarios existentes
SELECT usuCedula, usuNombres, usuApellidos, rolSisIdFk, usuContrasena 
FROM usuario 
LIMIT 5;

-- Ver si existe rol 2 (instructor)
SELECT DISTINCT rolSisIdFk FROM usuario;

-- Si necesitas agregar un usuario test con rol instructor (2)
UPDATE usuario SET rolSisIdFk = 2 WHERE usuCedula = 1234567890;

-- Verifica que la contraseña está hasheada (comienza con $2b$)
SELECT usuCedula, LEFT(usuContrasena, 10) as hash_start FROM usuario LIMIT 3;
```

---

## 🧪 PRUEBA DE LOGIN COMPLETA

1. **Abrir navegador:** `http://localhost:5173`

2. **Abrir DevTools:** Presionar `F12`

3. **Ir a Console:** Click en tab "Console"

4. **Hay 3 opciones de usuario test:**
   
   **Opción A: Instructor (rol=2) - debe ir a /dashboard-instructor**
   - Cédula: [MISMO QUE VISTE EN SQL]
   - Contraseña: [LA QUE HAYAS PUESTO]

   **Opción B: Aprendiz (rol≠2) - debe ir a /student-dashboard**
   - Cédula: [OTRO USER DE SQL CON OTRO ROL]
   - Contraseña: [SU CONTRASEÑA]

5. **Ver logs de Console:**
   - ✅ `Iniciando login con cédula: ...`
   - ✅ `Datos recibidos del servidor: {...}`
   - ✅ `Rol es Instructor (2) - Redirigiendo a /dashboard-instructor`

6. **Ver que la URL cambio a:**
   - Si es Instructor: `http://localhost:5173/dashboard-instructor`
   - Si es Aprendiz: `http://localhost:5173/student-dashboard`

---

## 🐛 DEBUG RÁPIDO

### Ver localStorage
```javascript
// En Console del navegador:
localStorage
// O se más específico:
localStorage.getItem('userCedula')
localStorage.getItem('userRoleId')
localStorage.getItem('userName')
```

### Ver respuesta exacta del servidor
```javascript
// Copiar en Console del navegador:
fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({cedula: 1234567890, pass: 'password'})
}).then(r => r.json()).then(console.log)
```

### Ver logs del backend
```bash
# En la terminal donde corre "npm run start:dev"
# Buscar líneas que empiezan con:
# 🔍 [LoginService]
# ✅ [LoginService]  
# 📤 [LoginService]
```

---

## ⚠️ ERRORES COMUNES

### Error: "Documento o contraseña son incorrectos"
**Solución 1:** Verificar en Base de Datos
```sql
SELECT usuCedula, usuContrasena FROM usuario WHERE usuCedula = 1234567890;
```
**Solución 2:** Si la contraseña no empieza con `$2b$`, es que no está encriptada

### Error: Login funciona pero no redirige
**Revisar:**
```javascript
// En Console:
console.log(localStorage.getItem('userRoleId'))
// Debe mostrar: "2" o "3" (no vacío)
```

### Error: "Cannot find module" o "Cannot resolve"
**Solución:**
```bash
cd backend
npm install

cd frontend
npm install
```

---

## 📋 CHECK LIST

Antes de reportar un problema:

- [ ] ¿El backend está corriendo? (Terminal 1 sin errores)
- [ ] ¿El frontend está corriendo? (Terminal 2 muestra localhost:5173)
- [ ] ¿La BD tiene el usuario? (SELECT en MySQL)
- [ ] ¿La contraseña comienza con `$2b$`? (SELECT de contraseña)
- [ ] ¿El campo rolSisIdFk tiene valor? (SELECT de rol)
- [ ] ¿Abriste DevTools (F12) para ver logs? (Console tab)
- [ ] ¿Viste los emojis ✅ en los logs? (Si no, hay error)

---

## 🔧 SI NADA FUNCIONA

**Paso 1:** Limpiar cachés
```bash
# Frontend
rm -rf frontend/node_modules frontend/.vite
npm install

# Backend
rm -rf backend/node_modules
npm install
```

**Paso 2:** Reiniciar servicios
```bash
# Terminal 1 - Ctrl+C para parar backend
npm run start:dev

# Terminal 2 - Ctrl+C para parar frontend  
npm run dev
```

**Paso 3:** Resetear Base de Datos
```sql
-- Ver qué hay en usuario
SELECT * FROM usuario LIMIT 1;

-- Si no hay, insertar uno test
INSERT INTO usuario (usu_cedula, usu_nombres, usu_apellidos, usu_contraseña, rol_sis_ID_FK)
VALUES (1086111118, 'Test', 'Usuario', '$2b$10$...bcrypt_hash...', 2);
```

**Paso 4:** Revisar logs línea por línea
- Terminal backend: ¿Muestra los emojis?
- Console frontend: ¿Muestra los emojis?
- Network tab (F12): ¿Respuesta es 200?

---

## 📞 INFORMACIÓN DE CONTACTO

Si después de todo lo anterior sigue fallando:
1. Tomar screenshot de los logs
2. Copiar respuesta de Network tab
3. Revisar si la BD está actualizada

