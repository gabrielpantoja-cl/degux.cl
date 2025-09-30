# Guía Completa de n8n - VPS Gabriel Pantoja

## 📋 Información General

**n8n** es la plataforma de automatización de workflows implementada en nuestro VPS. Permite crear automatizaciones visuales sin código, conectando diferentes servicios y APIs.

### Estado Actual
- ✅ **Estado**: Funcionando correctamente (verificado 14/Sep/2025)
- 🌐 **URL de acceso**: http://n8n.gabrielpantoja.cl
- 🔐 **Autenticación**: Habilitada (usuario/contraseña)
- 🏗️ **Arquitectura**: PostgreSQL + Redis + n8n (configuración profesional)

---

## 🏗️ Arquitectura y Configuración

### Servicios Docker

```yaml
# Servicios n8n corriendo:
- n8n              # Aplicación principal (puerto 5678)
- n8n-db           # Base de datos PostgreSQL 15
- n8n-redis        # Cache Redis 7
```

### Red Docker
- **Red**: `vps-do_vps_network` (compartida con nginx-proxy y portainer)
- **DNS interno**: Los contenedores se comunican por nombre

### Nginx Proxy
```nginx
# Configuración en /nginx/conf.d/n8n.conf
server {
    listen 80;
    server_name n8n.gabrielpantoja.cl;

    location / {
        proxy_pass http://n8n:5678;
        # Headers para WebSocket y seguridad
    }
}
```

---

## 🔑 Credenciales y Acceso

### Variables de Entorno (.env)
```bash
# Autenticación básica
N8N_BASIC_AUTH_USER=gabriel
N8N_BASIC_AUTH_PASSWORD=gmfCPYzZwPJSpiDgNuwtVLTzk4pk1wwkVDBAGpP8xTs=

# Encriptación
N8N_ENCRYPTION_KEY=ysUD76kIWzBAwHu4ff1RMQ4RTCA7vK8ejAqR/2Aeijs=

# Base de datos
N8N_DB_PASSWORD=XFP/CQpBiQzU5/kxR1R3C3fqBBWOrQPvkBruBNOSnFU=

# Redis
N8N_REDIS_PASSWORD=fKC3A9ADRIFfnTG2XO8z0r1vBY6eV8gqvH5olP3ILl0=
```

### Acceso Web
1. Navegador: http://n8n.gabrielpantoja.cl
2. Usuario: `gabriel`
3. Contraseña: Ver variable `N8N_BASIC_AUTH_PASSWORD` en .env

---

## 🚀 Comandos de Administración

### Gestión con Docker Compose

```bash
# Iniciar todos los servicios n8n
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d

# Ver estado de servicios n8n
docker ps --filter name=n8n

# Ver logs de n8n
docker compose -f docker-compose.yml -f docker-compose.n8n.yml logs n8n

# Reiniciar solo n8n
docker compose -f docker-compose.yml -f docker-compose.n8n.yml restart n8n

# Parar servicios n8n
docker compose -f docker-compose.yml -f docker-compose.n8n.yml stop
```

### Diagnóstico de Conectividad

```bash
# Verificar salud de n8n internamente
docker exec nginx-proxy curl -I http://n8n:5678/healthz

# Probar acceso externo
curl -I http://n8n.gabrielpantoja.cl

# Verificar redes Docker
docker network inspect vps-do_vps_network

# Ver logs de nginx para errores de n8n
docker logs nginx-proxy --tail 20 | grep n8n
```

---

## 🔧 Solución de Problemas Comunes

### Error 502 Bad Gateway

**Síntomas**: n8n muestra 502 al acceder desde el navegador

**Posibles causas y soluciones**:

1. **n8n no está en la red correcta**:
   ```bash
   # Verificar red de n8n
   docker inspect n8n --format '{{.NetworkSettings.Networks}}'

   # Si no está en vps-do_vps_network, recrear:
   docker compose -f docker-compose.yml -f docker-compose.n8n.yml down
   docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d
   ```

2. **DNS caché en nginx**:
   ```bash
   # Reiniciar nginx para refrescar DNS
   docker restart nginx-proxy
   ```

3. **n8n no responde internamente**:
   ```bash
   # Verificar salud
   docker exec nginx-proxy curl http://n8n:5678/healthz

   # Si falla, revisar logs de n8n
   docker logs n8n --tail 20
   ```

### Contenedores no arrancan

**Base de datos**:
```bash
# Verificar logs de PostgreSQL
docker logs n8n-db --tail 20

# Problema común: permisos de volumen
docker volume inspect vps-do_n8n_db_data
```

**Redis**:
```bash
# Verificar logs de Redis
docker logs n8n-redis --tail 20
```

---

## 📊 Monitoreo y Métricas

### Health Checks Configurados

```yaml
# n8n
healthcheck:
  test: ["CMD-SHELL", "wget --spider http://localhost:5678/healthz"]
  interval: 30s
  timeout: 10s
  retries: 5

# PostgreSQL
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U n8n -d n8n"]

# Redis
healthcheck:
  test: ["CMD-SHELL", "redis-cli ping"]
```

### Verificación de Estado

```bash
# Estado de todos los contenedores n8n
docker ps --filter name=n8n --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar métricas de salud
docker inspect n8n --format '{{.State.Health.Status}}'
```

---

## 🔐 Configuración de Seguridad

### Medidas Implementadas

1. **Autenticación básica habilitada**
2. **Headers de seguridad en nginx**:
   - Strict-Transport-Security
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection
   - Referrer-Policy

3. **Acceso solo por dominio específico** (`n8n.gabrielpantoja.cl`)
4. **Base de datos con contraseña fuerte**
5. **Redis con autenticación**

### Consideraciones Adicionales

- n8n corre sin privilegios root
- Datos persistentes en volúmenes Docker
- Zona horaria configurada (America/Santiago)

---

## 🛠️ Mantenimiento y Respaldos

### Datos Importantes

```bash
# Volúmenes Docker que contienen datos:
vps-do_n8n_data        # Workflows y configuración de n8n
vps-do_n8n_db_data     # Base de datos PostgreSQL
vps-do_n8n_files       # Archivos subidos a n8n
vps-do_n8n_redis_data  # Cache Redis
```

### Respaldo

```bash
# Respaldar base de datos
docker exec n8n-db pg_dump -U n8n n8n > backup_n8n_$(date +%Y%m%d).sql

# Respaldar volúmenes
docker run --rm -v vps-do_n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n_data_$(date +%Y%m%d).tar.gz /data
```

### Actualización

```bash
# Actualizar a la versión más reciente
cd /home/gabriel/vps-do
docker compose -f docker-compose.yml -f docker-compose.n8n.yml pull
docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d
```

---

## 🚀 Ideas de Automatización

### ⭐ Email Motivacional Diario (IMPLEMENTADO)

**Workflow configurado**: Envío automático de emails motivacionales

#### 📧 Cómo funciona:
1. **Trigger**: Cron job diario a las 8:00 AM
2. **Contenido**: Mensajes y frases motivacionales aleatorias
3. **Formato**: Email HTML elegante con diseño profesional
4. **Entrega**: Gmail SMTP con App Password

#### 🔧 Configuración del Workflow:

**Nodos utilizados**:
```
1. Cron Trigger → 2. Set (Contenido) → 3. Send Email
```

**Script de contenido dinámico**:
```javascript
const mensajes = [
  "¡Hoy es el día perfecto para lograr algo increíble! 💪",
  "Cada pequeño paso te acerca a tus grandes metas 🚀",
  "Tu futuro yo te agradecerá por lo que hagas hoy ⭐",
  "Los sueños no funcionan a menos que tú lo hagas 🔥",
  "Hoy es tu oportunidad de brillar 🌟",
  "El éxito comienza con el primer paso. ¡Dalo hoy! 👣",
  "Eres más fuerte de lo que crees 💪",
  "Cada día es una nueva página en blanco para escribir tu historia 📖"
];

const frases = [
  "\"El único modo de hacer un gran trabajo es amar lo que haces.\" - Steve Jobs",
  "\"La innovación distingue a los líderes de los seguidores.\" - Steve Jobs",
  "\"No te limites. Muchas personas se limitan a lo que creen que pueden hacer.\" - Mary Kay Ash",
  "\"El éxito es la suma de pequeños esfuerzos repetidos día tras día.\" - Robert Collier"
];

// Generar contenido aleatorio
const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)];
const frase = frases[Math.floor(Math.random() * frases.length)];
const fecha = new Date().toLocaleDateString('es-ES', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const contenidoHTML = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 10px;">
  <h1 style="text-align: center; margin-bottom: 30px;">🚀 Tu Momento de Inspiración</h1>

  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="margin-top: 0;">Hoy es ${fecha}</h2>
    <p style="font-size: 18px; line-height: 1.6;">${mensaje}</p>
  </div>

  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h3>💡 Frase del día:</h3>
    <p style="font-style: italic; font-size: 16px; line-height: 1.5;">${frase}</p>
  </div>

  <div style="text-align: center; margin-top: 30px;">
    <p style="margin: 0;">¡Que tengas un día productivo y lleno de éxito!</p>
    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">Enviado con ❤️ desde tu servidor VPS</p>
  </div>
</div>`;

return { mensaje, frase, fecha, contenidoHTML };
```

#### ⚙️ Configuración SMTP:
```
Host: smtp.gmail.com
Port: 587
User: tu-email@gmail.com
Password: [App Password de Gmail - no tu contraseña normal]
Subject: 🚀 Tu dosis diaria de motivación - {{$now.format('DD/MM/YYYY')}}
```

#### 📱 Para configurar App Password de Gmail:
1. Cuenta Google → Seguridad → Verificación en 2 pasos
2. Contraseñas de aplicación → Generar nueva
3. Usar esa contraseña de 16 caracteres en n8n

### Casos de Uso Adicionales

1. **Mensajes motivacionales (otros canales)**:
   - Telegram bot con frases inspiradoras
   - WhatsApp Business API (avanzado)

2. **Monitoreo del VPS**:
   - Alertas por email si servicios fallan
   - Reportes de uso de recursos
   - Notificaciones de actualizaciones disponibles

3. **Integración con Luanti**:
   - Notificaciones de jugadores conectados
   - Respaldos automáticos del mundo
   - Estadísticas de uso del servidor

4. **Productividad personal**:
   - Recordatorios de tareas
   - Sincronización de calendarios
   - Resúmenes de noticias diarios

---

## 📚 Recursos y Referencias

### Enlaces Útiles
- **Documentación oficial**: https://docs.n8n.io/
- **Nodos disponibles**: https://n8n.io/integrations/
- **Comunidad**: https://community.n8n.io/
- **Plantillas**: https://n8n.io/workflows/

### Archivos de Configuración Relevantes
- `docker-compose.n8n.yml`: Definición de servicios
- `nginx/conf.d/n8n.conf`: Configuración del proxy
- `.env`: Variables de entorno y credenciales

---

## 📝 Historial de Cambios

### 2025-09-14
- ✅ **Restaurada conectividad**: Solucionado problema 502 Bad Gateway
- ✅ **Verificada configuración**: Confirmados todos los servicios funcionando
- ✅ **Documentación consolidada**: Creada esta guía completa

### Reporte previo (2025-09-08)
- ✅ n8n funcionando correctamente (3 semanas activo)
- ✅ Todos los health checks pasando
- ✅ Configuración estable en producción

---

*Guía actualizada: 14 de septiembre de 2025*
*Mantenida por: Gabriel Pantoja*