# Diagnóstico y Solución - degux.cl Deployment
**Fecha**: 6 de Octubre, 2025
**Estado Inicial**: Aplicación mostrando contenido incorrecto
**Estado Final**: Script de deployment automatizado creado

---

## 🔍 Diagnóstico Realizado

### Problema Reportado
degux.cl mostraba contenido antiguo/incorrecto. Se sospechaba cache de Cloudflare pero el problema era más profundo.

### Hallazgos del Diagnóstico

#### ❌ Problemas Críticos Identificados

1. **NO existe configuración Nginx para degux.cl**
   ```bash
   $ ls /etc/nginx/sites-available/
   default  pitutito.cl
   # ← degux.cl NO EXISTE
   ```
   - Solo existe configuración para `pitutito.cl`
   - Nginx no sabe cómo enrutar tráfico a degux.cl

2. **PM2 NO está instalado**
   ```bash
   $ pm2 --version
   bash: pm2: command not found
   ```
   - No hay process manager instalado
   - Documentación asume PM2 pero no está configurado

3. **Proceso manual corriendo en puerto 3000**
   ```bash
   $ ps aux | grep next-server
   gabriel  1802024  next-server (v15.3.5)  # Puerto 3000
   root     257601   next-server (v15.5.4)  # Puerto 3000 (antiguo)
   ```
   - Hay proceso corriendo pero NO gestionado por PM2
   - Proceso manual no tiene autostart ni gestión de logs

4. **DNS apunta a Cloudflare proxy**
   ```bash
   $ dig +short degux.cl
   104.21.4.42      # Cloudflare
   172.67.131.164   # Cloudflare
   # VPS real: 167.172.251.27
   ```
   - DNS configurado en modo proxy (naranja)
   - Tráfico pasa por Cloudflare pero VPS no tiene config

5. **Inconsistencia en documentación**
   - `DEPLOYMENT_PRODUCTION_GUIDE.md` dice: Puerto 3000
   - `degux.cl.conf.example` dice: Puerto 3001
   - Proceso real: Puerto 3000 (sin PM2)

#### ✅ Estado Positivo

- ✅ Repositorio clonado: `/home/gabriel/degux.cl`
- ✅ Build existe: `.next/BUILD_ID = TJy8ysiKCts3TJtKc7OuW`
- ✅ Aplicación funcional en puerto 3000
- ✅ Nginx funcionando (sirve pitutito.cl correctamente)
- ✅ PostgreSQL corriendo en puerto 5433

---

## 📊 Arquitectura Actual vs Esperada

### Arquitectura Actual (Problemática)
```
Internet
    ↓
Cloudflare (104.21.4.42)
    ↓
VPS Nginx (167.172.251.27)
    ↓
??? (sin configuración para degux.cl)
    ❌ NO HAY RUTA CONFIGURADA

Proceso manual: next-server en :3000 (sin PM2)
```

### Arquitectura Esperada (Solución)
```
Internet
    ↓
Cloudflare (modo proxy opcional)
    ↓
VPS Nginx (167.172.251.27:443)
    ↓
Nginx reverse proxy (SSL con certbot)
    ↓
PM2 → degux-app → Next.js (:3000)
```

---

## 🎯 Solución Implementada

He creado **3 scripts** para resolver el problema:

### 1. `deploy-degux-simple.sh` ⭐ RECOMENDADO

**Script todo-en-uno** que configura completamente degux.cl:

```bash
sudo bash /home/gabriel/vps-do/scripts/deploy-degux-simple.sh
```

**Qué hace:**
1. ✅ Instala PM2 globalmente
2. ✅ Verifica build de Next.js (o lo ejecuta)
3. ✅ Detiene proceso manual en puerto 3000
4. ✅ Inicia aplicación con PM2 (autostart configurado)
5. ✅ Crea configuración Nginx para degux.cl
6. ✅ Configura SSL con `certbot --nginx` (automático)
7. ✅ Habilita redirect HTTP → HTTPS

**Ventajas:**
- Un solo comando
- SSL automático con certbot
- PM2 configurado con autostart
- Logs persistentes con PM2

---

### 2. `setup-degux-production.sh`

Script alternativo si prefieres control manual del SSL:

```bash
sudo bash /home/gabriel/vps-do/scripts/setup-degux-production.sh
```

**Diferencia:** Crea config Nginx HTTP y deja SSL para después.

---

### 3. `enable-ssl-degux.sh`

Complemento del script #2 para habilitar SSL manualmente:

```bash
# Primero generar certificados
sudo certbot certonly --webroot -w /var/www/letsencrypt \
  -d degux.cl -d www.degux.cl \
  --email admin@degux.cl --agree-tos

# Luego habilitar HTTPS
sudo bash /home/gabriel/vps-do/scripts/enable-ssl-degux.sh
```

---

## 🚀 Pasos para Ejecutar

### Opción A: Deploy Automatizado (Recomendado)

```bash
# 1. SSH al VPS
ssh gabriel@167.172.251.27

# 2. Ir al repo vps-do
cd /home/gabriel/vps-do

# 3. Pull últimos cambios (incluye los scripts)
git pull origin main

# 4. Ejecutar script automatizado
sudo bash scripts/deploy-degux-simple.sh
```

**Tiempo estimado:** 5-10 minutos (incluye SSL)

---

### Opción B: Deploy Manual Paso a Paso

Si prefieres control total:

```bash
# 1. Instalar PM2
sudo npm install -g pm2

# 2. Detener proceso manual
kill $(lsof -ti:3000)

# 3. Iniciar con PM2
cd /home/gabriel/degux.cl
PORT=3000 pm2 start npm --name "degux-app" -- start
pm2 save
pm2 startup

# 4. Crear config Nginx
sudo nano /etc/nginx/sites-available/degux.cl
# (copiar contenido del script)

# 5. Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/degux.cl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Configurar SSL
sudo certbot --nginx -d degux.cl -d www.degux.cl
```

---

## 🔐 Configuración DNS Recomendada

### Durante Setup (SSL)

**IMPORTANTE:** Para que Let's Encrypt funcione, DNS debe apuntar directamente al VPS:

```
Cloudflare Dashboard:
- Tipo: A
- Nombre: degux.cl
- Contenido: 167.172.251.27
- Proxy: ⚪ DNS only (GRIS) ← IMPORTANTE
- TTL: Auto
```

### Después de SSL Configurado

Puedes habilitar Cloudflare CDN:

```
- Proxy: 🟠 Proxied (NARANJA) ← Habilita CDN
```

**Cache Settings en Cloudflare:**
- Browser Cache TTL: 4 hours
- Edge Cache TTL: Respect existing headers

---

## 📋 Verificaciones Post-Deploy

### 1. Verificar PM2
```bash
pm2 list
# Debe mostrar "degux-app" en estado "online"

pm2 logs degux-app --lines 20
# Debe mostrar logs sin errores
```

### 2. Verificar Nginx
```bash
sudo nginx -t
# Debe mostrar "test is successful"

curl -I http://127.0.0.1:3000/
# Debe responder 200 OK
```

### 3. Verificar SSL
```bash
curl -I https://degux.cl/
# Debe mostrar:
# HTTP/2 200
# x-nextjs-cache: ...
# cf-cache-status: ... (si Cloudflare proxy está activo)
```

### 4. Verificar Redirect HTTP → HTTPS
```bash
curl -I http://degux.cl/
# Debe mostrar:
# HTTP/1.1 301 Moved Permanently
# Location: https://degux.cl/
```

---

## 🐛 Troubleshooting

### Problema: "pm2: command not found"
```bash
sudo npm install -g pm2
```

### Problema: "Port 3000 already in use"
```bash
# Ver qué proceso usa el puerto
sudo lsof -i:3000

# Detener proceso
sudo kill <PID>
```

### Problema: SSL falla con certbot
```bash
# Verificar DNS apunta al VPS
dig +short degux.cl
# Debe mostrar: 167.172.251.27

# Verificar Cloudflare en modo "DNS only" (gris)
# NO "Proxied" (naranja) durante generación SSL
```

### Problema: Cambios no se reflejan
```bash
# 1. Limpiar cache de Next.js
cd /home/gabriel/degux.cl
rm -rf .next/cache

# 2. Rebuild
npm run build

# 3. Reiniciar PM2
pm2 restart degux-app

# 4. Purgar cache Cloudflare (si está en modo proxy)
# Dashboard → Caching → Purge Everything
```

---

## 📊 Comandos Útiles Post-Deploy

```bash
# Ver logs en tiempo real
pm2 logs degux-app

# Ver solo errores
pm2 logs degux-app --err

# Ver métricas (CPU, RAM)
pm2 monit

# Reiniciar app
pm2 restart degux-app

# Reiniciar con nuevas variables de entorno
pm2 restart degux-app --update-env

# Ver info del proceso
pm2 info degux-app

# Ver logs de Nginx
sudo tail -f /var/log/nginx/degux_access.log
sudo tail -f /var/log/nginx/degux_error.log
```

---

## 📝 Resumen de Cambios

### Archivos Creados
```
vps-do/
├── scripts/
│   ├── deploy-degux-simple.sh       ← Script principal (todo-en-uno)
│   ├── setup-degux-production.sh    ← Setup sin SSL automático
│   └── enable-ssl-degux.sh          ← Habilitar SSL manualmente
├── docs/services/degux/
│   └── DIAGNOSTICO_DEPLOYMENT_2025-10-06.md  ← Este archivo
```

### Configuración VPS (después de ejecutar script)
```
VPS (167.172.251.27):
├── PM2 instalado globalmente
├── /etc/nginx/sites-available/degux.cl  ← Nueva config
├── /etc/nginx/sites-enabled/degux.cl    ← Symlink habilitado
├── /etc/letsencrypt/live/degux.cl/      ← Certificados SSL
└── /home/gabriel/degux.cl/              ← App corriendo con PM2
```

---

## ✅ Estado Final Esperado

Después de ejecutar `deploy-degux-simple.sh`:

- ✅ PM2 instalado y configurado
- ✅ degux-app corriendo en puerto 3000 (PM2)
- ✅ Nginx configurado como reverse proxy
- ✅ SSL/TLS configurado (Let's Encrypt)
- ✅ HTTP → HTTPS redirect activo
- ✅ PM2 autostart habilitado (reboot safe)
- ✅ Logs persistentes con PM2
- ✅ https://degux.cl accesible y funcional

---

## 🔗 Referencias

- **Repo App**: https://github.com/gabrielpantoja-cl/degux.cl
- **Repo VPS**: https://github.com/gabrielpantoja-cl/vps-do
- **Guía Deployment**: `docs/services/degux/DEPLOYMENT_PRODUCTION_GUIDE.md`
- **PM2 Docs**: https://pm2.keymetrics.io/
- **Certbot Docs**: https://certbot.eff.org/

---

🤖 Diagnóstico realizado por Claude Code
📅 6 de Octubre, 2025
