# 🗄️ Resumen de Configuración - Base de Datos degux.cl

**Fecha de Configuración**: 2025-10-06
**Estado**: ✅ Configurado y Listo para Migración

---

## 📊 Información de la Base de Datos

### Conexión
- **Contenedor**: `n8n-db` (compartido con N8N)
- **Base de Datos**: `degux`
- **Usuario**: `degux_user`
- **Puerto**: `5432` (interno), `5432` (externo - compartido)
- **Password**: Ver `.env.local` → `DEGUX_DB_PASSWORD`

### Connection Strings

**Desarrollo (desde máquina local)**:
```
postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@167.172.251.27:5432/degux?schema=public
```

**Producción (dentro VPS)**:
```
postgresql://degux_user:PASSWORD@n8n-db:5432/degux?schema=public
```

---

## ✅ Tablas Creadas (NextAuth)

### 1. User
Tabla principal de usuarios con autenticación.

**Columnas**:
- `id` (TEXT, PK) - UUID generado automáticamente
- `email` (TEXT, UNIQUE, NOT NULL) - Email único del usuario
- `emailVerified` (TIMESTAMP, NULL) - Fecha de verificación de email
- `name` (TEXT, NULL) - Nombre del usuario
- `image` (TEXT, NULL) - URL de imagen de perfil
- `role` (TEXT, DEFAULT 'user') - Rol del usuario (user, admin, etc.)
- `createdAt` (TIMESTAMP, NOT NULL) - Fecha de creación
- `updatedAt` (TIMESTAMP, NOT NULL) - Fecha de última actualización

**Índices**:
- Primary Key en `id`
- Unique constraint en `email`
- Index en `email` para búsquedas rápidas

**Triggers**:
- Auto-actualización de `updatedAt` al modificar registro

---

### 2. Account
Tabla de cuentas OAuth (Google, GitHub, etc.).

**Columnas**:
- `id` (TEXT, PK) - UUID generado automáticamente
- `userId` (TEXT, FK → User.id, CASCADE) - Referencia al usuario
- `type` (TEXT, NOT NULL) - Tipo de cuenta (oauth, email, etc.)
- `provider` (TEXT, NOT NULL) - Proveedor OAuth (google, github, etc.)
- `providerAccountId` (TEXT, NOT NULL) - ID de cuenta en el proveedor
- `refresh_token` (TEXT, NULL) - Token de refresh OAuth
- `access_token` (TEXT, NULL) - Token de acceso OAuth
- `expires_at` (INTEGER, NULL) - Timestamp de expiración del token
- `token_type` (TEXT, NULL) - Tipo de token (Bearer, etc.)
- `scope` (TEXT, NULL) - Scopes autorizados
- `id_token` (TEXT, NULL) - ID token de OpenID Connect
- `session_state` (TEXT, NULL) - Estado de sesión OAuth
- `createdAt` (TIMESTAMP, NOT NULL) - Fecha de creación
- `updatedAt` (TIMESTAMP, NOT NULL) - Fecha de última actualización

**Constraints**:
- UNIQUE (provider, providerAccountId) - Un usuario no puede tener 2 cuentas del mismo proveedor

**Índices**:
- Index en `userId` para búsquedas rápidas

---

### 3. Session
Tabla de sesiones activas.

**Columnas**:
- `id` (TEXT, PK) - UUID generado automáticamente
- `sessionToken` (TEXT, UNIQUE, NOT NULL) - Token único de sesión
- `userId` (TEXT, FK → User.id, CASCADE) - Referencia al usuario
- `expires` (TIMESTAMP, NOT NULL) - Fecha de expiración de la sesión
- `createdAt` (TIMESTAMP, NOT NULL) - Fecha de creación
- `updatedAt` (TIMESTAMP, NOT NULL) - Fecha de última actualización

**Índices**:
- Index en `userId`
- Index en `sessionToken` para validación rápida

---

### 4. VerificationToken
Tabla de tokens de verificación (email, password reset, etc.).

**Columnas**:
- `identifier` (TEXT, NOT NULL) - Identificador (email, etc.)
- `token` (TEXT, UNIQUE, NOT NULL) - Token único
- `expires` (TIMESTAMP, NOT NULL) - Fecha de expiración

**Primary Key**: Compuesta (identifier, token)

---

## 🔧 Funciones y Triggers

### update_updated_at_column()
Función que actualiza automáticamente el campo `updatedAt` cuando se modifica un registro.

**Triggers activos**:
- `update_user_updated_at` en tabla `User`
- `update_account_updated_at` en tabla `Account`
- `update_session_updated_at` en tabla `Session`

---

## 📁 Migrations Aplicadas

1. **01_init_postgis.sql** - ⚠️ PostGIS no instalado (no crítico)
2. **02_nextauth_schema.sql** - ✅ Schema completo de NextAuth

---

## 🧪 Verificación del Setup

### Test de Conexión
```bash
docker exec -it n8n-db psql -U degux_user -d degux
```

### Listar Tablas
```sql
\dt
```

**Resultado esperado**:
```
 public | Account           | table | degux_user
 public | Session           | table | degux_user
 public | User              | table | degux_user
 public | VerificationToken | table | degux_user
```

### Ver Estructura de User
```sql
\d "User"
```

### Contar Registros
```sql
SELECT COUNT(*) FROM "User";
```

**Resultado actual**: 0 usuarios (base de datos limpia)

---

## 🚀 Próximos Pasos para Migración

### 1. Conectar Frontend de degux.cl
El backend debe configurar el archivo `.env` con:

```env
# Base de Datos PostgreSQL
POSTGRES_PRISMA_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@167.172.251.27:5432/degux?schema=public"

# NextAuth
NEXTAUTH_SECRET="<generar_con_openssl_rand_-base64_32>"
NEXTAUTH_URL="https://degux.cl"

# Google OAuth
GOOGLE_CLIENT_ID="<tu_client_id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<tu_client_secret>"

# Ambiente
NODE_ENV="production"
```

### 2. Probar Autenticación
Usar el script de diagnóstico:
```bash
cd /home/gabriel/Documentos/vps-do/degux/temp-back-end-copy
./check-db.sh vps
./test-auth.sh vps
```

### 3. Crear Usuario Admin Inicial (Opcional)
Si necesitas crear un usuario admin manualmente:

```sql
-- Conectar a la base de datos
docker exec -it n8n-db psql -U degux_user -d degux

-- Crear usuario (se creará automáticamente al hacer login con Google)
-- Luego actualizar rol:
UPDATE "User"
SET role = 'admin'
WHERE email = 'tu_email@gmail.com';
```

---

## 📊 Estado de Tablas

| Tabla             | Registros | Estado |
|-------------------|-----------|--------|
| User              | 0         | ✅ Listo |
| Account           | 0         | ✅ Listo |
| Session           | 0         | ✅ Listo |
| VerificationToken | 0         | ✅ Listo |

---

## 🔒 Seguridad

- ✅ Usuario `degux_user` con permisos restringidos
- ✅ Base de datos aislada de N8N
- ✅ Password seguro de 32+ caracteres
- ✅ Foreign keys con CASCADE para integridad referencial
- ✅ Índices para prevenir duplicados (email, sessionToken)

---

## 📝 Notas Importantes

1. **Compartición de Contenedor**: La base de datos `degux` comparte el contenedor PostgreSQL `n8n-db` con N8N, pero están completamente aisladas.

2. **PostGIS**: No está instalado en el contenedor actual. Si se necesita funcionalidad geoespacial, será necesario:
   - Cambiar imagen base a `postgres:15-alpine` con PostGIS
   - O instalar PostGIS manualmente en el contenedor

3. **Backups**: Configurar backups regulares de la base de datos `degux`:
   ```bash
   ./scripts/backup-degux.sh
   ```

4. **Prisma**: Si el proyecto usa Prisma, el schema de Prisma debe sincronizarse con estas tablas usando:
   ```bash
   npx prisma db pull  # Para generar schema desde BD existente
   ```

---

## ✅ Checklist de Migración

- [x] Base de datos `degux` creada
- [x] Usuario `degux_user` configurado
- [x] Tabla `User` creada con estructura correcta
- [x] Tabla `Account` creada (OAuth)
- [x] Tabla `Session` creada
- [x] Tabla `VerificationToken` creada
- [x] Índices configurados
- [x] Triggers de auto-actualización configurados
- [x] Migration guardada en repositorio
- [ ] Backend conectado y probado
- [ ] Primer login con Google exitoso
- [ ] Usuario admin creado

---

**Configurado por**: Claude Code
**Documentación**: Ver `/degux/temp-back-end-copy/BACKEND_README.md`