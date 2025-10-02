# 🚀 Estado del Deployment - degux.cl

**Última actualización**: 01 de Octubre, 2025 - 23:30
**Sesión**: Deployment inicial a producción

---

## 📊 Estado Actual del VPS

### ✅ Infraestructura Confirmada

**VPS Digital Ocean** (167.172.251.27):
```
/home/gabriel/
├── vps-do/              ✅ Administración del servidor
│   ├── degux/           ✅ Scripts y configs
│   └── nginx/           ✅ Configuraciones Nginx
│
├── degux.cl/            ✅ Código de la aplicación (NUEVO)
│   ├── src/             ✅ Next.js 15 App
│   ├── prisma/          ✅ Database schema
│   ├── node_modules/    🔄 1.2GB instalado (npm install en progreso)
│   └── .env.production  ✅ Creado
│
├── Vegan-Wetlands/      ✅ Servidor de videojuego
│   └── (luanti.gabrielpantoja.cl en puerto 3000)
│
└── landing-temp/        ✅ Landing temporal
```

**Servicios activos:**
- ✅ Nginx (ports 80/443)
- ✅ N8N Web (port 5678) - http://n8n.gabrielpantoja.cl
- ✅ PostgreSQL (port 5432) en contenedor `n8n-db`
  - ✅ Database: `n8n` (workflows)
  - ✅ Database: `degux` (aplicación)
- ✅ Portainer (port 9443)
- ✅ pitutito.cl → localhost:3000 (luanti/Vegan-Wetlands)

**Recursos VPS:**
- Total RAM: 2GB
- Usado: ~1.4GB
- Disponible: ~600MB
- Disco: 26GB disponibles de 58GB

---

## 🔍 Diagnóstico Realizado (01 Oct 2025)

### ❌ PROBLEMA PRINCIPAL IDENTIFICADO

**degux.cl muestra la página de luanti (pitutito.cl)**

**Causa raíz:**
1. ✅ DNS de degux.cl apunta a **Cloudflare** (104.21.4.42), no al VPS
2. ❌ **NO existe configuración de Nginx** para degux.cl en `/etc/nginx/sites-available/`
3. ✅ pitutito.cl (luanti) está configurado para puerto 3000
4. ❌ Cuando Cloudflare proxy pasa el tráfico, Nginx no reconoce `server_name degux.cl` y sirve default (pitutito.cl)

**Verificado:**
```bash
# DNS actual
$ nslookup degux.cl
Name: degux.cl
Address: 104.21.4.42  # ← Cloudflare, NO el VPS (167.172.251.27)

# Nginx sites habilitados
$ ls /etc/nginx/sites-enabled/
pitutito.cl  # ← Solo este existe

# Nginx sites disponibles
$ ls /etc/nginx/sites-available/
default
pitutito.cl  # ← degux.cl NO EXISTE
```

**Configuración actual de pitutito.cl:**
```nginx
server {
    server_name pitutito.cl www.pitutito.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;  # ← Luanti (Vegan-Wetlands)
        # ...
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/pitutito.cl/fullchain.pem;
}
```

---

## ✅ Pasos Completados HOY

### 1. Repositorio Clonado ✅
```bash
# Ubicación: /home/gabriel/degux.cl/
# Repo: gabrielpantoja-cl/degux.cl
# Branch: main
# Tamaño: 32MB (código fuente)
# Commit: Latest from main
```

### 2. Variables de Entorno Creadas ✅
```bash
# Archivo: /home/gabriel/degux.cl/.env.production
# Permisos: 600 (seguro)
```

**Contenido:**
```env
# Database (Shared PostgreSQL in n8n-db container)
POSTGRES_PRISMA_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@n8n-db:5432/degux?schema=public"
POSTGRES_URL="postgresql://degux_user:bbsOwxrhG6oQeCnRHzWYh/Bd4Mrb4ZomPwSeO/uHJ/o=@n8n-db:5432/degux"

# NextAuth.js
NEXTAUTH_URL="https://degux.cl"
NEXTAUTH_SECRET="DLjnsoXolDZVeOxbGNJ6byMjwzDHIVSyLpmV1+PGzdU="

# Google OAuth (PENDIENTE: Configurar credenciales reales)
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"

# Node Environment
NODE_ENV="production"
```

⚠️ **PENDIENTE**: Reemplazar credenciales de Google OAuth

### 3. Instalación de Dependencias 🔄
```bash
# Estado: EN PROGRESO (npm install)
# node_modules: 1.2GB instalado
# Estimado: 90% completo
# Scripts postinstall en ejecución
```

### 4. Base de Datos Verificada ✅
```bash
# PostgreSQL 15.8 + PostGIS
# Container: n8n-db
# Database: degux
# User: degux_user
# Port: 5432 (interno al contenedor)
# Conexión desde VPS: FUNCIONAL ✅
```

### 5. Agentes de Claude Code Actualizados ✅
```bash
# 7 agentes especializados actualizados:
# - degux-orchestrator (renombrado)
# - infrastructure-agent (reescrito para deployment)
# - database-manager-agent (BD compartida)
# - api-developer-agent
# - security-auditor-agent
# - data-ingestion-agent
# - frontend-agent
#
# Commit: 7e62b24
```

---

## 🔧 Pasos PENDIENTES para Deployment

### PASO 1: Configurar Nginx para degux.cl ⏳

**Prioridad**: 🔴 CRÍTICA
**Tiempo**: 5 minutos
**Requiere**: Acceso sudo

**Comandos a ejecutar:**

```bash
# 1. SSH al VPS
ssh gabriel@167.172.251.27

# 2. Crear directorio para ACME challenge
sudo mkdir -p /var/www/letsencrypt

# 3. Crear configuración Nginx temporal para degux.cl
sudo nano /etc/nginx/sites-available/degux.cl
```

**Pegar este contenido:**
```nginx
# degux.cl - Configuración Nginx
# Puerto 3001 (pitutito.cl usa 3000)

server {
    listen 80;
    listen [::]:80;
    server_name degux.cl www.degux.cl;

    # ACME challenge para Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    # Temporal: Proxy a app en puerto 3001
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Habilitar y recargar:**
```bash
# 4. Habilitar el sitio
sudo ln -sf /etc/nginx/sites-available/degux.cl /etc/nginx/sites-enabled/

# 5. Test configuración
sudo nginx -t

# 6. Recargar Nginx
sudo systemctl reload nginx

# 7. Verificar
curl -I http://167.172.251.27 -H "Host: degux.cl"
```

---

### PASO 2: Completar npm install ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 5 minutos (automático)

```bash
# Verificar estado actual
ssh gabriel@167.172.251.27
cd ~/degux.cl
du -sh node_modules  # Debería ser ~1.3-1.5GB cuando termine

# Si no terminó, esperar o reiniciar
npm install
```

---

### PASO 3: Generar Prisma Client ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 2 minutos

```bash
ssh gabriel@167.172.251.27
cd ~/degux.cl

# Generar Prisma client
npx prisma generate
```

---

### PASO 4: Aplicar Migraciones a BD ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 3 minutos

```bash
cd ~/degux.cl

# Opción 1: Push schema (desarrollo)
npx prisma db push

# Opción 2: Migrations (producción - recomendado)
npx prisma migrate deploy

# Verificar tablas creadas
docker exec n8n-db psql -U degux_user -d degux -c "\dt"
```

**Tablas esperadas:**
- User
- Account
- Session
- VerificationToken
- Property
- Connection
- referenciales (ya existe)

---

### PASO 5: Build de Next.js ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 10-15 minutos

```bash
cd ~/degux.cl

# Build para producción
npm run build

# Verificar que el build fue exitoso
ls -la .next/
```

---

### PASO 6: Deploy con PM2 ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 5 minutos

**Instalar PM2:**
```bash
# Si no está instalado
sudo npm install -g pm2

# Verificar
pm2 --version
```

**Deploy de la app:**
```bash
cd ~/degux.cl

# Iniciar app en puerto 3001
PORT=3001 pm2 start npm --name "degux" -- start

# Guardar configuración PM2
pm2 save

# Auto-start en reboot
pm2 startup
# Ejecutar el comando que PM2 te dé

# Verificar
pm2 list
pm2 logs degux
```

---

### PASO 7: Configurar DNS (2 opciones) ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 5 minutos + propagación

**OPCIÓN A: Mantener Cloudflare (Recomendado)**

Si quieres mantener Cloudflare como CDN/Proxy:

1. En Cloudflare Dashboard:
   - Ir a degux.cl → DNS
   - Cambiar el registro A:
     - Nombre: `@`
     - Valor: `167.172.251.27`
     - Proxy status: ✅ Proxied (naranja)
   - Guardar

2. Esto mantiene las ventajas de Cloudflare (SSL, CDN, DDoS protection)

**OPCIÓN B: DNS Directo al VPS**

Si prefieres apuntar directamente al VPS:

1. En tu proveedor de dominios:
   - Cambiar nameservers a Cloudflare o tu DNS actual
   - Crear registro A:
     - Nombre: `@`
     - Valor: `167.172.251.27`
     - TTL: 3600
   - Crear registro A para www:
     - Nombre: `www`
     - Valor: `167.172.251.27`

**Verificar DNS:**
```bash
# Esperar 5-30 minutos, luego:
nslookup degux.cl
dig degux.cl +short

# Debería devolver: 167.172.251.27 (o IP de Cloudflare si usas proxy)
```

---

### PASO 8: Generar SSL con Let's Encrypt ⏳

**Prioridad**: 🟡 ALTA
**Tiempo**: 5 minutos
**Prerequisito**: DNS propagado

```bash
ssh gabriel@167.172.251.27

# Instalar certbot si no está
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Generar certificados
sudo certbot certonly --webroot \
  -w /var/www/letsencrypt \
  -d degux.cl \
  -d www.degux.cl \
  --email admin@degux.cl \
  --agree-tos \
  --non-interactive

# Verificar certificados
sudo ls -la /etc/letsencrypt/live/degux.cl/
```

**Actualizar Nginx para HTTPS:**
```bash
sudo nano /etc/nginx/sites-available/degux.cl
```

**Agregar bloque HTTPS:**
```nginx
# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name degux.cl www.degux.cl;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/degux.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/degux.cl/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/degux.cl/chain.pem;

    # SSL optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "origin-when-cross-origin" always;

    # Proxy to app
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/degux_access.log;
    error_log /var/log/nginx/degux_error.log;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name degux.cl www.degux.cl;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

**Recargar Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### PASO 9: Configurar Google OAuth ⏳

**Prioridad**: 🟢 MEDIA
**Tiempo**: 10 minutos

1. Ir a Google Cloud Console: https://console.cloud.google.com
2. Crear proyecto o seleccionar existente
3. Habilitar Google OAuth API
4. Crear credenciales OAuth 2.0:
   - Tipo: Web application
   - Authorized redirect URIs:
     - `https://degux.cl/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)

5. Actualizar `.env.production`:
```bash
ssh gabriel@167.172.251.27
nano ~/degux.cl/.env.production

# Reemplazar:
GOOGLE_CLIENT_ID="tu_client_id_real"
GOOGLE_CLIENT_SECRET="tu_client_secret_real"
```

6. Reiniciar app:
```bash
pm2 restart degux
```

---

### PASO 10: Backups Automáticos ⏳

**Prioridad**: 🟢 MEDIA
**Tiempo**: 10 minutos

```bash
# Crear script de backup
nano ~/scripts/backup-degux.sh
```

**Contenido:**
```bash
#!/bin/bash
# degux Database Backup Script

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/gabriel/backups/degux"
CONTAINER="n8n-db"
DB_NAME="degux"
DB_USER="degux_user"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
echo "[$(date)] Starting backup of $DB_NAME..."
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > \
  "$BACKUP_DIR/degux_$TIMESTAMP.sql.gz"

if [ $? -eq 0 ]; then
  echo "[$(date)] ✅ Backup successful: degux_$TIMESTAMP.sql.gz"
else
  echo "[$(date)] ❌ Backup failed!"
  exit 1
fi

# Remove old backups
find "$BACKUP_DIR" -name "degux_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[$(date)] Old backups cleaned (retention: $RETENTION_DAYS days)"

# Backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/degux_$TIMESTAMP.sql.gz" | cut -f1)
echo "[$(date)] Backup size: $BACKUP_SIZE"
```

**Configurar cron:**
```bash
chmod +x ~/scripts/backup-degux.sh

# Agregar a crontab
crontab -e

# Agregar esta línea (backup diario a las 3 AM):
0 3 * * * /home/gabriel/scripts/backup-degux.sh >> /var/log/degux-backup.log 2>&1
```

---

## 📋 Checklist de Deployment

### Fase 1: Configuración Base
- [x] Repositorio clonado en VPS
- [x] `.env.production` creado
- [x] Base de datos `degux` verificada
- [ ] `npm install` completado
- [ ] Configuración Nginx para degux.cl
- [ ] DNS configurado

### Fase 2: Aplicación
- [ ] Prisma client generado
- [ ] Migraciones aplicadas
- [ ] Next.js build exitoso
- [ ] PM2 deployment
- [ ] App accesible en puerto 3001

### Fase 3: SSL y Seguridad
- [ ] Certificado SSL generado
- [ ] HTTPS configurado en Nginx
- [ ] HTTP → HTTPS redirect
- [ ] Google OAuth configurado

### Fase 4: Producción
- [ ] degux.cl accesible vía HTTPS
- [ ] Login funcional
- [ ] Backups automáticos configurados
- [ ] Monitoring básico

---

## 🎯 Próxima Sesión - Plan de Acción

**Orden sugerido para mañana:**

1. **Verificar npm install** (2 min)
2. **Configurar Nginx** (PASO 1 - 5 min) 🔴 CRÍTICO
3. **Generar Prisma client** (PASO 3 - 2 min)
4. **Aplicar migraciones** (PASO 4 - 3 min)
5. **Build Next.js** (PASO 5 - 15 min)
6. **Deploy PM2** (PASO 6 - 5 min)
7. **Verificar app en puerto 3001**
8. **Configurar DNS** (PASO 7 - 5 min + esperar)
9. **Generar SSL** (PASO 8 - 5 min)
10. **Google OAuth** (PASO 9 - 10 min)
11. **Backups** (PASO 10 - 10 min)

**Tiempo total estimado**: 1-2 horas

---

## 🔧 Comandos Útiles de Troubleshooting

```bash
# Verificar servicios
sudo systemctl status nginx
pm2 status
docker ps

# Ver logs
pm2 logs degux
docker logs n8n-db
sudo tail -f /var/log/nginx/degux_error.log

# Reiniciar servicios
pm2 restart degux
sudo systemctl restart nginx
docker restart n8n-db

# Verificar puertos
sudo netstat -tlnp | grep -E ':3000|:3001|:5432'

# Test conexión BD
docker exec n8n-db psql -U degux_user -d degux -c "SELECT version();"

# Espacio en disco
df -h
du -sh ~/degux.cl/node_modules
```

---

## 📝 Notas Importantes

### Arquitectura Actual del VPS

El VPS aloja **múltiples proyectos**:

1. **vps-do** - Administración general del servidor
2. **Vegan-Wetlands** - Servidor de videojuego (luanti.gabrielpantoja.cl)
   - Usa puerto 3000
   - Dominio: pitutito.cl
3. **degux.cl** - Plataforma inmobiliaria (NUEVO)
   - Usará puerto 3001
   - Dominio: degux.cl

### Base de Datos Compartida

- Contenedor: `n8n-db` (PostgreSQL 15 + PostGIS)
- Puerto: 5432 (interno)
- Databases:
  - `n8n` - Workflows N8N
  - `degux` - Aplicación degux.cl ✅

### Variables de Entorno Sensibles

⚠️ **NO COMMITEAR** a Git:
- `.env.production`
- `.env.local`
- Cualquier archivo con passwords

### Puertos Usados

- 80/443: Nginx
- 3000: Luanti (pitutito.cl)
- 3001: degux.cl (NUEVO)
- 5432: PostgreSQL (interno)
- 5678: N8N
- 9443: Portainer

---

## 🆘 Contactos y Referencias

### Documentación
- [InfrastructureAgent.md](../../.claude/agents/InfrastructureAgent.md) - Guía completa de deployment
- [degux-infrastructure-guide.md](../03-arquitectura/degux-infrastructure-guide.md) - Arquitectura VPS
- [CLAUDE.md](../../CLAUDE.md) - Instrucciones para Claude Code

### Repositorios
- **App**: https://github.com/gabrielpantoja-cl/degux.cl
- **VPS Admin**: https://github.com/gabrielpantoja-cl/vps-do
- **Luanti**: https://github.com/gabrielpantoja-cl/Vegan-Wetlands

### Credenciales (Ver .env files - NO en Git)
- Database: Ver `vps-do/.env`
- NextAuth: Ver `degux.cl/.env.production`

---

**Estado**: 🟡 Deployment en progreso (50% completo)
**Próximo paso crítico**: Configurar Nginx para degux.cl
**Blocker actual**: Ninguno - listo para continuar

**Última verificación**: 01 Oct 2025 23:30
