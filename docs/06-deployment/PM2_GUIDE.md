# Guía de PM2 - Process Manager para Node.js

## ¿Qué es PM2?

**PM2** (Process Manager 2) es un administrador de procesos avanzado para aplicaciones Node.js en producción. Es como un "supervisor" que mantiene tu aplicación Next.js ejecutándose 24/7 en el VPS.

### ¿Por qué lo necesitamos?

Sin PM2, si ejecutas `npm start` en el VPS:
- ❌ La aplicación se detiene cuando cierras la terminal SSH
- ❌ Si hay un error, la aplicación crashea y no se reinicia
- ❌ No hay logs centralizados
- ❌ No puedes monitorear el uso de recursos (CPU, RAM)

Con PM2:
- ✅ La aplicación corre en background (daemon)
- ✅ Se reinicia automáticamente si crashea
- ✅ Se inicia automáticamente al reiniciar el VPS
- ✅ Logs centralizados y persistentes
- ✅ Monitoreo de recursos en tiempo real
- ✅ Zero-downtime deployments
- ✅ Cluster mode para aprovechar múltiples CPUs

---

## Instalación

### Opción 1: Global (requiere sudo)
```bash
sudo npm install -g pm2
```

### Opción 2: Con npx (sin sudo) - **Recomendado**
No necesitas instalar, solo usar `npx pm2` cada vez:
```bash
npx pm2 status
npx pm2 start npm --name "degux-app" -- start
```

### Opción 3: Local en el proyecto
```bash
npm install pm2 --save-dev
npx pm2 status
```

---

## Comandos Esenciales

### 1. Iniciar la aplicación
```bash
# Iniciar Next.js en producción
npx pm2 start npm --name "degux-app" -- start

# O con un ecosystem file (más configuración)
npx pm2 start ecosystem.config.js
```

### 2. Ver estado de procesos
```bash
# Lista de procesos
npx pm2 status

# Información detallada de un proceso
npx pm2 show degux-app

# Monitoreo en tiempo real
npx pm2 monit
```

### 3. Ver logs
```bash
# Logs en tiempo real
npx pm2 logs

# Logs de una app específica
npx pm2 logs degux-app

# Últimas 100 líneas
npx pm2 logs degux-app --lines 100

# Solo errores
npx pm2 logs degux-app --err

# Limpiar logs antiguos
npx pm2 flush
```

### 4. Reiniciar/Recargar
```bash
# Restart (para con delay y reinicia)
npx pm2 restart degux-app

# Reload (zero-downtime restart)
npx pm2 reload degux-app

# Stop
npx pm2 stop degux-app

# Delete (elimina de PM2)
npx pm2 delete degux-app
```

### 5. Guardar configuración
```bash
# Guardar lista de procesos actual
npx pm2 save

# Configurar autostart al reiniciar VPS
npx pm2 startup

# Deshabilitar autostart
npx pm2 unstartup
```

---

## Configuración para degux.cl

### Ecosystem File (ecosystem.config.js)

Crea este archivo en la raíz del proyecto para configuración avanzada:

```javascript
module.exports = {
  apps: [{
    name: 'degux-app',
    script: 'npm',
    args: 'start',
    cwd: '/home/gabriel/degux.cl',
    instances: 1,  // O 'max' para cluster mode
    exec_mode: 'fork',  // O 'cluster' para múltiples instancias
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};
```

Luego iniciar con:
```bash
npx pm2 start ecosystem.config.js
```

---

## Monitoreo y Debugging

### Ver métricas en tiempo real
```bash
# Dashboard interactivo
npx pm2 monit

# Información detallada
npx pm2 show degux-app

# Historial de restarts
npx pm2 describe degux-app
```

### Ver uso de recursos
```bash
# CPU y memoria
npx pm2 status

# Información del sistema
npx pm2 info degux-app
```

### Logs avanzados
```bash
# Logs con timestamps
npx pm2 logs --timestamp

# Logs en formato JSON
npx pm2 logs --json

# Logs desde hace 1 hora
npx pm2 logs --since 1h

# Logs filtrados
npx pm2 logs | grep "ERROR"
```

---

## Cluster Mode (Opcional)

Para aprovechar múltiples CPUs del VPS:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'degux-app',
    script: 'npm',
    args: 'start',
    instances: 2,  // O 'max' para usar todos los CPUs
    exec_mode: 'cluster',
    watch: false,
  }]
};
```

**Ventajas:**
- Mejor rendimiento con tráfico alto
- Load balancing automático
- Zero-downtime deployments con `pm2 reload`

**Desventajas:**
- Más consumo de RAM
- Complejidad adicional con WebSockets (no aplica a degux.cl por ahora)

---

## Troubleshooting

### La aplicación no inicia
```bash
# Ver logs de error
npx pm2 logs degux-app --err --lines 50

# Información detallada del proceso
npx pm2 describe degux-app

# Verificar que Next.js está compilado
cd /home/gabriel/degux.cl
ls -la .next/
```

### Consumo alto de memoria
```bash
# Ver uso de memoria
npx pm2 status

# Reiniciar automáticamente si supera 1GB
# (configurar en ecosystem.config.js: max_memory_restart: '1G')

# Restart manual
npx pm2 restart degux-app
```

### La aplicación crashea constantemente
```bash
# Ver historial de restarts
npx pm2 describe degux-app

# Ver logs completos
npx pm2 logs degux-app --lines 200

# Verificar variables de entorno
cat /home/gabriel/degux.cl/.env.production
```

### PM2 no está disponible después de reiniciar VPS
```bash
# Configurar autostart (ejecutar una sola vez)
npx pm2 startup

# Guardar configuración actual
npx pm2 save

# Verificar que está configurado
systemctl status pm2-gabriel
```

---

## Integración con GitHub Actions

Nuestro workflow usa `npx pm2` para evitar problemas de permisos:

```yaml
# .github/workflows/deploy-production.yml
script: |
  cd /home/gabriel/degux.cl
  git pull origin main
  npm ci
  npm run build

  # Restart con PM2
  npx pm2 restart degux-app || npx pm2 start npm --name "degux-app" -- start
  npx pm2 save
```

**Ventajas de usar `npx pm2`:**
- ✅ No requiere instalación global
- ✅ No requiere permisos sudo
- ✅ Usa la versión del proyecto (package.json)
- ✅ Funciona en cualquier entorno

---

## Comandos Útiles del Día a Día

### Deployment Manual
```bash
# Conectar al VPS
ssh gabriel@167.172.251.27

# Ir al directorio del proyecto
cd /home/gabriel/degux.cl

# Actualizar código
git pull origin main

# Reinstalar dependencias
npm ci

# Rebuild
npm run build

# Restart
npx pm2 restart degux-app

# Ver logs
npx pm2 logs degux-app --lines 50
```

### Verificar Estado de la Aplicación
```bash
# Ver si está corriendo
npx pm2 status

# Ver logs recientes
npx pm2 logs degux-app --lines 20

# Ver métricas
npx pm2 monit
```

### Limpiar y Reiniciar
```bash
# Limpiar logs antiguos
npx pm2 flush

# Restart limpio
npx pm2 restart degux-app

# Rebuild completo
cd /home/gabriel/degux.cl
rm -rf .next
npm run build
npx pm2 restart degux-app
```

---

## Alternativas a PM2

### Systemd (nativo de Linux)
- ✅ No requiere dependencias adicionales
- ✅ Integración nativa con Linux
- ❌ Configuración más compleja
- ❌ Menos features que PM2

### Docker + Docker Compose
- ✅ Aislamiento completo
- ✅ Deployment consistente
- ❌ Más complejo de configurar
- ❌ Mayor overhead de recursos

### Vercel/Netlify (PaaS)
- ✅ Zero configuración
- ✅ Escalado automático
- ❌ Menos control
- ❌ Costos adicionales

**Para degux.cl:** PM2 es la mejor opción porque:
- Control total del VPS
- Configuración simple
- Sin costos adicionales
- Monitoreo incorporado

---

## Referencias

- **Documentación oficial:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **PM2 Runtime:** https://pm2.keymetrics.io/docs/usage/pm2-runtime/
- **PM2 Cheat Sheet:** https://devhints.io/pm2
- **Ecosystem File:** https://pm2.keymetrics.io/docs/usage/application-declaration/

---

## Resumen

PM2 es **esencial** para correr Next.js en producción en el VPS. Sin él, la aplicación se detendría cada vez que cierras SSH.

**Comandos más usados:**
```bash
npx pm2 status                          # Ver estado
npx pm2 logs degux-app                  # Ver logs
npx pm2 restart degux-app               # Reiniciar
npx pm2 monit                           # Monitorear
npx pm2 save                            # Guardar configuración
```

**GitHub Actions se encarga automáticamente** de restart con PM2 en cada deployment. 🚀
