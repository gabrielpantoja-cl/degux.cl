# Degux - Documentación del Proyecto

**Ecosistema Digital Colaborativo del Sector Inmobiliario Chileno**

---

## 📌 Estado del Proyecto

| Item | Estado |
|------|--------|
| Dominio | ✅ degux.cl (activo) |
| Infraestructura VPS | ✅ Completada |
| Base de Datos | ✅ PostgreSQL + PostGIS (n8n-db compartido) |
| SSL/HTTPS | ✅ Configurado |
| Aplicación Web | 🔄 En desarrollo |
| Repositorio Web | https://github.com/gabrielpantoja-cl/degux.cl.git |

**Última actualización**: 01 de Octubre, 2025

---

## 🚀 PRÓXIMOS PASOS (IMPORTANTE)

**⚠️ La infraestructura está 100% lista. Sigue estos pasos para completar el deployment:**

### **[→ Ver PRÓXIMOS PASOS Detallados](./NEXT-STEPS.md)** ⭐ EMPEZAR AQUÍ

**Resumen rápido:**
1. **[CRÍTICO]** Configurar DNS del dominio (5 min + 30 min propagación)
2. **[CRÍTICO]** Generar certificados SSL (5 min)
3. **[CRÍTICO]** Activar HTTPS en Nginx (10 min)
4. **[IMPORTANTE]** Configurar backups automáticos (5 min)
5. **[IMPORTANTE]** Preparar app web en desarrollo local (1-2 horas)
6. **[IMPORTANTE]** Deploy a producción en Vercel (30 min)
7. **[OPCIONAL]** Configurar N8N workflows (1-2 horas)
8. **[OPCIONAL]** Setup monitoring (30 min)

**Tiempo estimado total**: 4-6 horas (mínimo viable) | 5-9 horas (completo)

---

## 📚 Documentación Disponible

### 🏗️ Guías de Infraestructura

- **[Guía Completa de Infraestructura](./degux-infrastructure-guide.md)** ⭐ PRINCIPAL
  - Arquitectura del sistema
  - Base de datos compartida con N8N
  - Configuración de dominios y SSL
  - Deployment completo
  - Backups y monitoreo
  - Troubleshooting

- **[Decisiones de Arquitectura](./architecture-decisions.md)**
  - ADRs (Architecture Decision Records)
  - Por qué compartir contenedor con N8N
  - Elección de PostgreSQL + PostGIS
  - Estrategia de deployment

### 📖 Documentación Relacionada

**En el repositorio vps-do:**

- `/docs/DEPLOYMENT_DEGUX.md` - Guía paso a paso de deployment
- `/degux/README.md` - Documentación de base de datos
- `/docs/projects/Plan_Trabajo_Ecosistema_Digital_V4.md` - Plan maestro del proyecto
- `/nginx/conf.d/degux.cl.conf` - Configuración Nginx
- `/scripts/setup-degux-db.sh` - Script de setup de BD
- `/scripts/backup-degux.sh` - Script de backups
- `/scripts/restore-degux.sh` - Script de restore

**En el repositorio web:**

- https://github.com/gabrielpantoja-cl/degux.cl.git - Código de la aplicación

---

## 🚀 Quick Start

### Ver Estado Actual

```bash
# SSH al VPS
ssh gabriel@167.172.251.27

# Ver contenedores activos
docker ps | grep -E "n8n-db|nginx"

# Verificar base de datos degux
docker exec -it n8n-db psql -U degux_user -d degux -c "SELECT PostGIS_Version();"

# Ver sitio web
curl https://degux.cl
```

### Acceso Rápido

| Servicio | URL |
|----------|-----|
| Sitio Principal | https://degux.cl |
| API | https://api.degux.cl |
| Portainer (gestión) | https://167.172.251.27:9443 |
| N8N (workflows) | http://n8n.gabrielpantoja.cl |

---

## 🔑 Información Clave

### Arquitectura

**⚠️ IMPORTANTE**: Degux **NO tiene su propio contenedor PostgreSQL**.

En su lugar, aprovecha el contenedor `n8n-db` existente, creando una base de datos independiente dentro del mismo servidor. Esta decisión:

- Ahorra ~300MB de RAM
- Reduce costos (vs servicios externos como Neon)
- Mantiene aislamiento total de datos
- Simplifica operaciones

**Diagrama simplificado:**

```
n8n-db (container)
  ├── BD: n8n      (para N8N workflows)
  └── BD: degux    (para Degux app) ← Completamente aislada
```

### Connection Strings

```env
# Desarrollo (desde tu máquina)
DATABASE_URL="postgresql://degux_user:PASSWORD@167.172.251.27:5432/degux?schema=public"

# Producción (dentro del VPS)
DATABASE_URL="postgresql://degux_user:PASSWORD@n8n-db:5432/degux?schema=public"
```

**Nota**: El password se encuentra en `.env.local` (respaldado localmente, NO en GitHub)

---

## 🛠️ Comandos Útiles

### Base de Datos

```bash
# Conectarse a la BD degux
docker exec -it n8n-db psql -U degux_user -d degux

# Ver bases de datos en n8n-db
docker exec -it n8n-db psql -U n8n -d postgres -c "\l"

# Backup manual
./scripts/backup-degux.sh

# Restore desde backup
./scripts/restore-degux.sh degux_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Nginx

```bash
# Reiniciar Nginx
docker compose restart nginx

# Ver logs
docker logs nginx-proxy -f

# Verificar sintaxis
docker exec nginx-proxy nginx -t
```

### SSL

```bash
# Generar certificados (después de configurar DNS)
docker compose --profile ssl-setup run --rm certbot

# Verificar certificados
docker exec nginx-proxy ls -la /etc/nginx/ssl/live/degux.cl/
```

---

## 📞 Soporte y Troubleshooting

Si encuentras problemas, consulta:

1. **[Guía de Infraestructura](./degux-infrastructure-guide.md#troubleshooting)** - Sección de troubleshooting completa
2. **Logs del sistema**:
   ```bash
   docker logs n8n-db --tail 100
   docker logs nginx-proxy --tail 100
   ```
3. **Estado de servicios**:
   ```bash
   ./scripts/deploy.sh status
   ```

---

## 🎯 Próximos Pasos

### Para Desarrollo Local

1. Clonar repo web: `git clone https://github.com/gabrielpantoja-cl/degux.cl.git`
2. Configurar `.env.local` con connection string de desarrollo
3. Instalar dependencias: `npm install`
4. Ejecutar migrations: `npx prisma migrate dev`
5. Iniciar dev server: `npm run dev`

### Para Production Deployment

Ver guía completa: `/docs/DEPLOYMENT_DEGUX.md`

---

## 📧 Contacto

- **Repositorio VPS**: https://github.com/gabrielpantoja-cl/vps-do.git
- **Repositorio Web**: https://github.com/gabrielpantoja-cl/degux.cl.git
- **VPS IP**: 167.172.251.27
- **Dominio**: degux.cl

---

**¿Primera vez aquí?** → Lee la **[Guía Completa de Infraestructura](./degux-infrastructure-guide.md)**
