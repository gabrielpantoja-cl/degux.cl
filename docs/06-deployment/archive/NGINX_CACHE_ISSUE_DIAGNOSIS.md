# Diagnóstico: Problema de Cache en Nginx - degux.cl

**Fecha**: 6 de Octubre, 2025
**Problema**: Producción muestra build antigua a pesar de rebuild y purge de Cloudflare
**Status**: 🔴 **CRÍTICO** - Requiere intervención manual con sudo

---

## 🔍 Resumen Ejecutivo

**Causa Raíz**: Nginx está sirviendo contenido antiguo porque:
1. ❌ **NO existe configuración específica** para `degux.cl` en `/etc/nginx/sites-available/`
2. ❌ Nginx está usando configuración **default** o **pitutito.cl** para servir degux.cl
3. ❌ Posible cache en Nginx o archivos estáticos servidos desde directorio antiguo

**Evidencia**:
- VPS puerto 3000 (PM2): ✅ Sirve contenido correcto - BUILD_ID `JaY6N58aMmM8LymraskRD`
- VPS HTTPS (Nginx): ❌ Sirve contenido antiguo - BUILD_ID `BsnOPbYfj2db_ogPfTqXF`
- Cloudflare CDN: ❌ Cachea contenido antiguo de Nginx

---

## 📊 Cronología del Diagnóstico

### 1. Verificación Inicial

```bash
# VPS sirviendo correcto en puerto 3000
ssh gabriel@167.172.251.27 "curl -s http://localhost:3000/ | grep 'degux\.cl' | wc -l"
# Resultado: 26 referencias a degux.cl ✅

# Producción (Cloudflare) sirviendo antiguo
curl -s https://degux.cl/ | grep 'referenciales\.cl' | wc -l
# Resultado: múltiples referencias a referenciales.cl ❌
```

### 2. Descubrimiento de Nginx

```bash
# Verificar puertos abiertos
ssh gabriel@167.172.251.27 "ss -tulnp | grep -E ':(80|443|3000)'"

# Resultado:
tcp   LISTEN 0  4096  0.0.0.0:443   0.0.0.0:*   # ← Nginx HTTPS
tcp   LISTEN 0  4096  0.0.0.0:80    0.0.0.0:*   # ← Nginx HTTP
tcp   LISTEN 0  511   *:3000        *:*         # ← PM2 (Next.js)
```

**Conclusión**: Cloudflare → Nginx (80/443) → PM2 (3000)

### 3. Prueba Directa a Nginx

```bash
# Acceso directo a VPS vía IP con Host header
curl -k -H "Host: degux.cl" https://167.172.251.27/ | grep 'application-name'

# Resultado:
<meta name="application-name" content="referenciales.cl"/>  # ❌ ANTIGUO
<!--BsnOPbYfj2db_ogPfTqXF-->  # BUILD_ID antiguo
```

**Prueba comparativa al puerto 3000**:
```bash
ssh gabriel@167.172.251.27 "curl -s http://localhost:3000/ | grep 'application-name'"

# Resultado:
<meta name="application-name" content="degux.cl"/>  # ✅ CORRECTO
<!--JaY6N58aMmM8LymraskRD-->  # BUILD_ID nuevo
```

**Diagnóstico confirmado**: Nginx está sirviendo build antigua, PM2 sirve build correcta.

### 4. Inspección de Configuración Nginx

```bash
# Verificar sitios disponibles
ssh gabriel@167.172.251.27 "ls -la /etc/nginx/sites-available/"

# Resultado:
default
pitutito.cl  # ← Solo existe pitutito.cl, NO degux.cl
```

```bash
# Verificar sitios activos
ssh gabriel@167.172.251.27 "ls -la /etc/nginx/sites-enabled/"

# Resultado:
pitutito.cl -> ../sites-available/pitutito.cl  # ← Solo pitutito.cl
```

**Conclusión**: NO existe configuración de Nginx para degux.cl

### 5. Análisis de Configuración pitutito.cl

```nginx
# /etc/nginx/sites-available/pitutito.cl
server {
    server_name pitutito.cl www.pitutito.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;  # ← Hace proxy a PM2
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/pitutito.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pitutito.cl/privkey.pem;
}
```

**Configuración correcta** - hace proxy al puerto 3000 donde PM2 sirve Next.js.

---

## 🔬 Hipótesis sobre el Problema

### Hipótesis A: Server Block Default Catch-All

**Teoría**: Nginx tiene un `server {}` block default que está:
- Capturando requests a `degux.cl` (porque no existe configuración específica)
- Sirviendo archivos estáticos de un directorio antiguo
- O haciendo proxy a un servicio diferente

**Evidencia**:
- `/etc/nginx/sites-available/default` existe pero no pudimos leer sin sudo
- Requests a `degux.cl` llegan a Nginx (puerto 443 está escuchando)
- Nginx responde con contenido antiguo

### Hipótesis B: Virtualhost Compartido con pitutito.cl

**Teoría**: La configuración de `pitutito.cl` podría estar capturando requests a `degux.cl` si:
- Ambos apuntan al mismo puerto 3000
- Hay algún `server_name` wildcard o default_server

**Problema con esta teoría**:
- `pitutito.cl` tiene `server_name` específico (no wildcard)
- PM2 sirve contenido correcto en puerto 3000
- Entonces Nginx debería servir contenido correcto

### Hipótesis C: Nginx Cache o Archivos Estáticos Antiguos ⭐ **MÁS PROBABLE**

**Teoría**: Nginx está:
1. Cacheando responses HTML antiguas (proxy_cache)
2. O sirviendo archivos `.next/` antiguos desde filesystem

**Evidencia fuerte**:
- Headers HTTP de producción muestran `cache-control: s-maxage=31536000` (1 año)
- BUILD_ID antiguo embebido en HTML: `<!--BsnOPbYfj2db_ogPfTqXF-->`
- Content-Security-Policy headers ANTIGUOS con referencias a Vercel y referenciales.cl

**Posibles ubicaciones de cache**:
```
/var/cache/nginx/
/tmp/nginx/
~/degux.cl/.next/  (si Nginx lee directamente de aquí)
```

---

## 🎯 Solución Propuesta

### Paso 1: Crear Configuración Nginx para degux.cl

**Archivo**: `/etc/nginx/sites-available/degux.cl`

```nginx
server {
    server_name degux.cl www.degux.cl;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # IMPORTANTE: No cachear en Nginx
        proxy_cache_bypass $http_upgrade;
        proxy_no_cache 1;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/degux.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/degux.cl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.degux.cl) {
        return 301 https://$host$request_uri;
    }

    if ($host = degux.cl) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name degux.cl www.degux.cl;
    return 404;
}
```

**Notas importantes**:
- `proxy_cache_bypass $http_upgrade;` - Bypass cache de Nginx
- `proxy_no_cache 1;` - No cachear responses
- SSL certificado debe existir en `/etc/letsencrypt/live/degux.cl/`

### Paso 2: Activar Configuración

```bash
# Copiar archivo generado
scp ~/Documentos/degux.cl/nginx-degux.conf gabriel@167.172.251.27:~/

# SSH al VPS
ssh gabriel@167.172.251.27

# Copiar a sites-available (requiere sudo)
sudo cp ~/nginx-degux.conf /etc/nginx/sites-available/degux.cl

# Crear symlink en sites-enabled
sudo ln -s /etc/nginx/sites-available/degux.cl /etc/nginx/sites-enabled/degux.cl

# Verificar configuración
sudo nginx -t

# Si OK, recargar Nginx
sudo systemctl reload nginx
```

### Paso 3: Limpiar Cache (si existe)

```bash
# Limpiar posible cache de Nginx
sudo rm -rf /var/cache/nginx/*
sudo rm -rf /tmp/nginx/*

# Reiniciar Nginx completamente
sudo systemctl restart nginx
```

### Paso 4: Verificar Certificado SSL

Si no existe certificado SSL para degux.cl:

```bash
# Generar certificado con Certbot
sudo certbot --nginx -d degux.cl -d www.degux.cl

# Certbot modificará automáticamente la configuración de Nginx
```

### Paso 5: Purgar Cloudflare

```bash
# Via API (desde máquina local con token guardado)
curl -X POST "https://api.cloudflare.com/client/v4/zones/6bace81d83af76b19e6eef5eea42b123/purge_cache" \
  -H "Authorization: Bearer IvCFOOUMiDXpIO2oeIlztN1jAQg-WKHgVIS6vR0x" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Paso 6: Verificación Final

```bash
# 1. Verificar VPS directamente (bypass Cloudflare)
curl -k -H "Host: degux.cl" https://167.172.251.27/ | grep 'application-name'
# Esperado: <meta name="application-name" content="degux.cl"/>

# 2. Esperar 2-3 minutos para propagación de Cloudflare

# 3. Verificar producción
curl -s https://degux.cl/ | grep 'application-name'
# Esperado: <meta name="application-name" content="degux.cl"/>

# 4. Verificar en navegador modo incognito
# Ctrl+Shift+N → https://degux.cl/
```

---

## 📋 Checklist de Acciones

### Acciones Completadas ✅

- [x] Swap de 2GB configurado en VPS
- [x] Rebuild completo de Next.js con cambios correctos
- [x] PM2 recreado desde cero
- [x] VPS puerto 3000 sirviendo contenido correcto
- [x] Múltiples purges de Cloudflare vía API
- [x] Diagnosticado problema: Nginx sirviendo contenido antiguo
- [x] Archivo de configuración Nginx creado: `nginx-degux.conf`

### Acciones Pendientes ⏳ (Requieren Sudo)

- [ ] Copiar `nginx-degux.conf` al VPS
- [ ] Instalar configuración en `/etc/nginx/sites-available/degux.cl`
- [ ] Crear symlink en `/etc/nginx/sites-enabled/`
- [ ] Verificar certificado SSL para degux.cl existe
- [ ] Si no existe: generar con `sudo certbot --nginx -d degux.cl -d www.degux.cl`
- [ ] Validar configuración: `sudo nginx -t`
- [ ] Limpiar cache de Nginx: `sudo rm -rf /var/cache/nginx/*`
- [ ] Recargar Nginx: `sudo systemctl reload nginx`
- [ ] Purgar Cloudflare (vía API - ya tenemos token)
- [ ] Verificar producción en navegador incognito

---

## 🔧 Comandos Rápidos para Troubleshooting

### Verificar qué está sirviendo Nginx

```bash
# Desde máquina local
curl -k -H "Host: degux.cl" https://167.172.251.27/ | grep -E '(title|BUILD_ID|application-name)'
```

### Verificar qué está sirviendo PM2 (correcto)

```bash
ssh gabriel@167.172.251.27 "curl -s http://localhost:3000/ | grep -E '(title|application-name)'"
```

### Ver logs de Nginx en tiempo real

```bash
ssh gabriel@167.172.251.27 "sudo tail -f /var/log/nginx/access.log"
ssh gabriel@167.172.251.27 "sudo tail -f /var/log/nginx/error.log"
```

### Ver configuración activa de Nginx

```bash
ssh gabriel@167.172.251.27 "sudo nginx -T | grep -A 30 'server_name.*degux'"
```

### Verificar procesos escuchando puertos

```bash
ssh gabriel@167.172.251.27 "sudo netstat -tulnp | grep -E ':(80|443|3000)'"
```

---

## 📊 Datos de Configuración DNS

**Archivo fuente**: `docs/dns-degux.cl.txt`

```dns
;; A Records
api.degux.cl.   1  IN  A  167.172.251.27  ; cf_tags=cf-proxied:false
degux.cl.       1  IN  A  167.172.251.27  ; cf_tags=cf-proxied:true
www.degux.cl.   1  IN  A  167.172.251.27  ; cf_tags=cf-proxied:true

;; NS Records
degux.cl.  86400  IN  NS  matteo.ns.cloudflare.com.
degux.cl.  86400  IN  NS  sara.ns.cloudflare.com.
```

**Cloudflare Proxy Status**:
- `degux.cl` → Proxied (nube naranja) ✅
- `www.degux.cl` → Proxied (nube naranja) ✅
- `api.degux.cl` → DNS Only (nube gris) ✅

**IPs de Cloudflare**:
```
104.21.4.42
172.67.131.164
```

---

## 🆘 Si Nginx Config NO Soluciona el Problema

### Plan B: Bypass Temporal de Cloudflare

**Opción**: Cambiar DNS a "DNS Only" (nube gris) temporalmente

1. Cloudflare Dashboard → degux.cl → DNS → Records
2. Click en registro A para `degux.cl`
3. Desactivar "Proxied" (cambiar a "DNS only" - nube gris)
4. Esperar 1-2 minutos para propagación DNS
5. Verificar: `dig +short degux.cl` debería mostrar `167.172.251.27`
6. Acceder directamente: `https://degux.cl/` (bypass Cloudflare)

**Riesgos**:
- ❌ Sin protección DDoS de Cloudflare
- ❌ Sin CDN (más lento para usuarios fuera del VPS)
- ❌ IP del VPS expuesta públicamente

**Solo usar si**:
- Nginx config no funciona
- Necesitas verificar urgentemente que VPS sirve contenido correcto
- Temporal (max 24 horas)

### Plan C: Verificar Default Server Block

Si existe `/etc/nginx/sites-available/default`:

```bash
ssh gabriel@167.172.251.27 "sudo cat /etc/nginx/sites-available/default"
```

Buscar:
- `default_server` en `listen` directives
- `server_name _` (catch-all)
- Rutas a archivos estáticos

---

## 📝 Referencias

- **Cloudflare API Token**: Guardado en `.env.local` (`CLOUDFLARE_API_TOKEN`)
- **Cloudflare Zone ID**: `6bace81d83af76b19e6eef5eea42b123`
- **VPS IP**: `167.172.251.27`
- **PM2 Port**: `3000`
- **Nginx Ports**: `80` (HTTP), `443` (HTTPS)

---

## 🎓 Lecciones Aprendidas

1. **Siempre verificar toda la cadena de proxies**: Cloudflare → Nginx → PM2
2. **Nginx puede cachear sin configuración explícita** de `proxy_cache`
3. **BUILD_ID de Next.js es la mejor forma** de verificar qué versión se está sirviendo
4. **Cloudflare "Purge Everything" NO limpia instantáneamente** - puede tardar hasta 30 minutos
5. **DNS Proxied (nube naranja) introduce capa adicional** de cache difícil de purgar

---

🤖 Documentación creada por Claude Code - degux.cl
