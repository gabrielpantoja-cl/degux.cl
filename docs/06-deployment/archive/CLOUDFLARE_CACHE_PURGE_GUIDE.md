# Guía de Purge de Cache de Cloudflare

**Fecha**: 6 de Octubre, 2025
**Problema**: "Purge Everything" no funciona, sigue mostrando contenido antiguo

---

## 🔍 Por qué "Purge Everything" puede no funcionar

1. **Propagación lenta** - Puede tardar hasta 30 minutos en algunos edge servers
2. **Cache del navegador** - El navegador cachea independientemente de Cloudflare
3. **Múltiples edge locations** - Cloudflare tiene 300+ data centers
4. **Service Workers** - Pueden cachear contenido en el navegador
5. **Development Mode** - Si está activo, puede comportarse distinto

---

## ✅ Opción B: Purge by URL (Más Preciso y Efectivo)

### Paso 1: Acceder a Cloudflare Dashboard

1. Ir a https://dash.cloudflare.com
2. Login con tu cuenta
3. Seleccionar dominio `degux.cl`

### Paso 2: Purge by URL

1. En el menú lateral, click en **"Caching"**
2. Click en **"Configuration"** (tab superior)
3. Scroll down hasta **"Purge Cache"**
4. Seleccionar **"Custom Purge"**
5. Seleccionar **"Purge by URL"**

### Paso 3: Agregar URLs Específicas

Copiar y pegar TODAS estas URLs (una por línea):

```
https://degux.cl/
https://www.degux.cl/
https://degux.cl/api/public/map-data
https://degux.cl/api/public/map-config
https://degux.cl/api/public/docs
https://degux.cl/_next/static/chunks/webpack-2d41bea2b8bb309c.js
https://degux.cl/_next/static/chunks/main-app-e1f02a60c30f8ad8.js
https://degux.cl/_next/static/chunks/app/layout-24ab50424776231d.js
https://degux.cl/_next/static/chunks/app/page-d8b2faa87825c6d9.js
https://degux.cl/_next/static/css/805f3d9fb7307a1e.css
https://degux.cl/_next/static/css/611a21d79d34230c.css
```

**Importante**: Cloudflare permite hasta 30 URLs por purge.

### Paso 4: Click "Purge"

Cloudflare mostrará confirmación: "Cache successfully purged"

---

## 🚀 Opción C: Purge by Tag o Prefix (Si disponible)

### Si tienes plan Pro o superior:

1. **Purge by Prefix**:
   ```
   https://degux.cl/_next/static/*
   https://degux.cl/api/*
   ```

2. **Purge by Cache Tag**:
   - Requiere configurar cache tags en Next.js
   - Más avanzado, no lo tenemos configurado aún

---

## 🛡️ Opción D: Development Mode (Temporal)

### Para Testing Inmediato

1. En Cloudflare Dashboard → **Caching** → **Configuration**
2. Activar **"Development Mode"** (toggle ON)
3. **Efectos**:
   - Deshabilita cache por 3 horas
   - Cada request va directo al VPS (sin cache)
   - Útil para verificar cambios inmediatamente

4. **Desactivar después** de verificar cambios

⚠️ **No dejar activo permanentemente** - aumenta carga en el VPS

---

## 🔧 Opción E: Purge via API (Automatizado)

### Usando Cloudflare API

```bash
# Configurar variables
CLOUDFLARE_ZONE_ID="tu_zone_id_aqui"
CLOUDFLARE_API_TOKEN="tu_api_token_aqui"

# Purge Everything via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'

# Purge by URL via API
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
     -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
     -H "Content-Type: application/json" \
     --data '{
       "files": [
         "https://degux.cl/",
         "https://degux.cl/_next/static/chunks/main-app.js"
       ]
     }'
```

### Obtener Zone ID

1. Cloudflare Dashboard → Seleccionar `degux.cl`
2. Overview (sidebar)
3. Scroll down → **API** section
4. **Zone ID**: copiar valor

### Crear API Token

1. Cloudflare Dashboard → My Profile (arriba derecha)
2. **API Tokens** (sidebar)
3. **Create Token**
4. Template: **"Purge Cache"** o **"Custom Token"**
5. Permissions: `Zone` → `Cache Purge` → `Purge`
6. Zone Resources: `Include` → `Specific zone` → `degux.cl`
7. **Continue to summary** → **Create Token**
8. **Copiar token** (solo se muestra una vez)

---

## 🧪 Verificación Post-Purge

### 1. Verificar Headers HTTP

```bash
# Verificar que NO esté cacheado
curl -I https://degux.cl/

# Buscar estos headers:
# cf-cache-status: MISS  ← Primera request después de purge
# cf-cache-status: HIT   ← Segunda request (ya cacheó de nuevo)
```

### 2. Verificar en Navegador (Modo Incognito)

```
1. Cerrar TODAS las ventanas del navegador
2. Abrir nueva ventana en modo incognito:
   - Chrome/Edge: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
3. Ir a: https://degux.cl/
4. Presionar F12 (abrir consola)
5. Tab "Network"
6. Recargar página (F5)
7. Buscar request a "/" (primera fila)
8. Ver headers:
   - cf-cache-status: MISS (bueno)
   - Cache-Control (debería ser nuevo)
```

### 3. Verificar Contenido

```javascript
// En consola del navegador (F12 → Console tab)
document.querySelector('title').textContent
// Debería mostrar: "degux.cl"

// Buscar referencias antiguas
document.body.innerHTML.includes('Referenciales.cl')
// Debería mostrar: false

document.body.innerHTML.includes('degux.cl')
// Debería mostrar: true
```

---

## 🎯 Plan de Acción Completo

### Opción Rápida (5 minutos)

1. ✅ Activar **Development Mode** en Cloudflare
2. ✅ Esperar 2 minutos
3. ✅ Verificar en modo incognito: https://degux.cl/
4. ✅ Si funciona → Desactivar Development Mode
5. ✅ Hacer **Purge by URL** con las URLs listadas arriba
6. ✅ Esperar 5 minutos
7. ✅ Verificar nuevamente en modo incognito

### Opción Completa (10 minutos)

1. ✅ Hacer **Purge by URL** (URLs específicas)
2. ✅ Esperar 5 minutos
3. ✅ Hard refresh en navegador:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
4. ✅ Si sigue antiguo → Activar **Development Mode**
5. ✅ Verificar cambios
6. ✅ Desactivar Development Mode
7. ✅ Hacer otro **Purge Everything**

---

## 🐛 Troubleshooting

### Sigo viendo contenido antiguo después de purge

**Posibles causas:**

1. **Cache del navegador**
   - Solución: Hard refresh (`Ctrl+Shift+R`)
   - O usar modo incognito

2. **Service Workers activos**
   ```javascript
   // En consola del navegador:
   navigator.serviceWorker.getRegistrations().then(registrations => {
     registrations.forEach(reg => reg.unregister())
   })
   ```

3. **DNS Cache local**
   ```bash
   # Windows
   ipconfig /flushdns

   # Mac/Linux
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

4. **Cloudflare aún propagando**
   - Esperar 30 minutos completos
   - Verificar desde otro dispositivo/red

5. **VPS sirviendo contenido antiguo**
   ```bash
   # Verificar directamente en VPS:
   ssh gabriel@167.172.251.27 "curl -s http://localhost:3000/ | grep 'degux\.cl' | wc -l"
   # Debería mostrar: 26 (o más)
   ```

---

## 📊 Monitoreo

### Ver estadísticas de cache

1. Cloudflare Dashboard → **Caching** → **Analytics**
2. Ver:
   - Cache Hit Rate (%)
   - Cached Requests
   - Uncached Requests
   - Bandwidth Saved

### Logs en tiempo real

1. Cloudflare Dashboard → **Analytics** → **Logs**
2. Filtrar por URL: `/`
3. Ver headers de cada request

---

## 🔗 Referencias

- **Cloudflare Purge Cache Docs**: https://developers.cloudflare.com/cache/how-to/purge-cache/
- **Development Mode**: https://developers.cloudflare.com/cache/how-to/development-mode/
- **Cache Analytics**: https://developers.cloudflare.com/cache/about/analytics/

---

🤖 Documentación creada por Claude Code - degux.cl
