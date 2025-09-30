# Plan de Trabajo: P&P Technologies - Ecosistema Digital Colaborativo V3.0

**Fecha:** 30 de Septiembre, 2025
**Autores:** Gabriel & Mona
**Versión:** 3.0 - Actualización con Infraestructura Real
**Proyecto:** Nexus Core (P&P Technologies / Pantoja & Partners)
**Repositorio:** https://github.com/gabrielpantoja-cl/new-project-nexus-core

---

## 🎯 Visión del Ecosistema Digital Colaborativo

Transformar de **PropTech regional** a **InfraTech del Sur de Chile**: ser la infraestructura base de datos inmobiliarios para Valdivia, Los Ríos y zona sur, expandiendo gradualmente a nivel nacional.

### Concepto Clave: **Ecosistema Digital Colaborativo**
- **Plataforma abierta** donde usuarios suben datos y acceden a análisis gratuitos
- **Crowdsourced data**: Los usuarios aportan datos, todos se benefician del conocimiento colectivo
- **API-first**: Otros desarrolladores pueden construir encima de nuestra infraestructura
- **Freemium radical**: Tasaciones gratuitas por sistema open source, monetización vía servicios enterprise
- **Datos como activo**: `referenciales-cl` se convierte en la "Bloomberg del mercado inmobiliario del sur de Chile"

---

## 🏗️ Infraestructura Actual (✅ YA IMPLEMENTADA)

### 🖥️ VPS Digital Ocean - Servidor Productivo
**IP:** 167.172.251.27
**Estado:** ✅ Operativo desde Agosto 2025
**Documentación:** `/vps-do-docs/`

#### Servicios Core Activos:

1. **Nginx Proxy Reverso** ✅
   - Puerto 80/443 expuesto
   - Proxy para todos los servicios web
   - SSL configurado vía Let's Encrypt

2. **Portainer (Gestión Docker)** ✅
   - URL: `https://167.172.251.27:9443`
   - Panel de administración visual
   - Gestión de contenedores, volúmenes, redes

3. **N8N (Automatización de Workflows)** ✅
   - URL: `http://n8n.gabrielpantoja.cl`
   - PostgreSQL + Redis incluidos
   - **Casos de uso actuales:**
     - Scraping de Portal Inmobiliario
     - Scraping de Mercado Libre
     - Automatización de correos (Gmail configurado)

4. **PostgreSQL (Base de Datos)** ✅
   - Instancia compartida con N8N
   - Usado para persistencia de scraping
   - **Disponible para proyectos adicionales**

#### Filosofía de Infraestructura:
- ✅ **Sostenible y Reproducible** - Todo como código en repositorio
- ✅ **Infraestructura como Código** - Docker Compose + GitHub
- ✅ **Documentación viviente** - vps-do-docs mantiene estado real
- ✅ **Modular** - Servicios independientes, fácil de escalar

---

## 🌐 Arquitectura de Componentes del Sitio Web

### ✅ Componentes YA IMPLEMENTADOS

#### 1. **Mapa con Estadísticas Avanzadas** ✅
- **Ruta:** `/dashboard/estadisticas`
- **Stack:** PostGIS + React Leaflet + Recharts
- **Features:**
  - Selección de áreas con herramienta de círculo
  - Estadísticas en tiempo real (precios, superficies, tendencias)
  - 6 tipos de gráficos: scatter, tendencias, histogramas
  - Generación de reportes PDF para CBR
  - Integración con datos del Conservador de Bienes Raíces

#### 2. **Data Ingestion Automatizada (N8N)** ✅
- **Workflows activos:**
  - Portal Inmobiliario scraping
  - Mercado Libre scraping
  - Notificaciones vía Gmail
- **Base de datos:** PostgreSQL en VPS
- **Frecuencia:** Configurable (diario, semanal, bajo demanda)

#### 3. **Infraestructura VPS** ✅
- Docker + Portainer para gestión visual
- Nginx como gateway único
- Backups automatizados (Vegan-wetlands-backup container)
- Monitoring y logs centralizados

---

### 🔜 Componentes EN DESARROLLO (Fase 1 - Actual)

#### 4. **Sistema de Perfiles Profesionales** 🔜
**Estado:** Schema diseñado, pendiente aplicar a BD
**Prioridad:** ALTA - Base para Networking y CRM

**Modelos Prisma creados:**
```prisma
User {
  // Nuevos campos de perfil
  bio, profession, company, phone
  region, commune, website, linkedin
  isPublicProfile

  // Relaciones
  properties[]
  connectionsInitiated[]
  connectionsReceived[]
}

Property {
  // Propiedades listadas por usuarios
  title, description, propertyType, status
  address, commune, region, lat, lng
  bedrooms, bathrooms, price
  images[], mainImage
}

Connection {
  // Red de networking
  requesterId, receiverId, status, message
}
```

**Rutas a implementar:**
- `/dashboard/perfil` - Editar mi perfil
- `/networking/[userId]` - Perfil público
- `/networking/mis-propiedades` - Mis propiedades

**Decisión pendiente:** Base de datos
- **Opción A:** Neon (serverless PostgreSQL con branching)
- **Opción B:** PostgreSQL self-hosted en VPS (ya disponible)
- **Opción C:** Híbrido (Neon dev, VPS producción)

---

### 🔜 Componentes PLANIFICADOS (Fase 2-5)

#### 5. **Networking - Red de Profesionales** 🔜
**Prioridad:** ALTA
**Dependencia:** Perfiles de Usuario (Fase 1)

- Directorio de profesionales (corredores, tasadores, arquitectos)
- Sistema de conexiones (estilo LinkedIn)
- Foro de discusión por categorías
- Sistema de mensajería privada
- Búsqueda por región/especialidad/servicios

#### 6. **Blog y Centro de Datos** 🔜
**Prioridad:** MEDIA (SEO y educación)

- Blog educativo sobre mercado inmobiliario
- Data stories con visualizaciones interactivas
- Análisis de mercado regional automatizados
- CMS para administradores y autores invitados
- SEO optimizado para captar tráfico orgánico

#### 7. **Sofía - Agente Bot RAG** 🔜
**Prioridad:** MEDIA-ALTA (Diferenciador técnico)
**Base actual:** `/chatbot` con modelo ChatMessage

**Mejoras planificadas:**
- Integrar Anthropic Claude con RAG
- Vector DB (Supabase pgvector o Pinecone)
- Contexto sobre:
  - Base de datos de referenciales
  - Documentos legales CBR/SII
  - Preguntas frecuentes
  - Datos de mercado en tiempo real
- Widget flotante disponible globalmente

#### 8. **CRM Inmobiliario Completo** 🔜
**Prioridad:** MEDIA
**Target:** Profesionales del sector

**Features:**
- Gestión de clientes y leads
- Pipeline de ventas visual (Kanban)
- Automatización de tareas y recordatorios
- Integración con propiedades de usuario
- Reportes de desempeño
- Sistema de notas y documentos

---

### ❌ Componentes EXCLUIDOS de la Plataforma

#### 1. **Página de Propiedades Dedicada (Estilo Portal Tradicional)**
- **Eliminado:** No habrá sección `/propiedades` con listado centralizado
- **Alternativa:** Las propiedades se visualizan en el perfil de cada usuario/corredor
- **Razón:** Modelo descentralizado donde cada profesional gestiona su propio showcase
- **Ventaja:** Fomenta networking y visibilidad de profesionales, no solo de propiedades

#### 2. **Página "Quiénes Somos"**
- **Eliminado:** No habrá página institucional tradicional "About Us"
- **Alternativa:** Información de la plataforma integrada en landing page y FAQ
- **Razón:** Plataforma colaborativa, no empresa tradicional
- **Ventaja:** Foco en comunidad y datos, no en la empresa detrás

---

## 🎯 Filosofía de Diseño del Ecosistema

**Modelo Descentralizado:**
- Cada usuario/profesional tiene su **perfil showcase** con sus propiedades
- La plataforma es el **conector**, no el portal
- Datos abiertos + herramientas + comunidad = ecosistema colaborativo

**Ejemplo de flujo de usuario:**
```
Usuario busca propiedad en Valdivia
  → Usa mapa con estadísticas (✅ implementado)
  → Encuentra áreas de interés
  → Ve propiedades en perfiles de corredores locales (🔜 Fase 1)
  → Contacta corredor vía networking (🔜 Fase 2)
  → Consulta con Sofía sobre tasaciones (🔜 Fase 3)
  → Corredor gestiona lead en CRM (🔜 Fase 4)
```

---

## 📊 Arquitectura de Datos y Base de Datos

### 🤔 Decisión Estratégica: ¿Qué Base de Datos Usar?

**Situación actual:**
- ✅ PostgreSQL operativo en VPS (usado por N8N)
- ✅ PostGIS disponible
- ✅ Backups configurados
- 🔜 MCP Neon configurado (serverless PostgreSQL)

**Opciones evaluadas:**

#### **Opción A: Neon (Serverless PostgreSQL)**
✅ Pros:
- Database branching (ramas de BD como Git)
- Autoscaling automático
- Free tier: 500MB + 5GB transfer
- PostGIS incluido
- Zero mantenimiento
- MCP ya configurado en Claude Code

⚠️ Contras:
- Vendor lock-in suave
- Costo post-free: ~$20-30/mes (10GB)
- Dependencia externa

#### **Opción B: PostgreSQL Self-hosted (VPS Actual)**
✅ Pros:
- Ya disponible y operativo
- Control total de datos
- Costo fijo ($0 adicional, VPS ya pagado)
- Filosofía 100% open source
- Compliance directo (datos en Chile)

⚠️ Contras:
- Mantenimiento manual
- Sin database branching
- Escalabilidad requiere trabajo
- DevOps time

#### **Opción C: Híbrido (Neon Dev + VPS Prod)**
✅ Pros:
- Branching para desarrollo
- Control en producción
- Mejor de ambos mundos

⚠️ Contras:
- Complejidad de setup
- Dos ambientes distintos
- Workflow más elaborado

---

### 🎯 Recomendación Actual

**Fase 1-2 (MVP - 3 meses):**
→ **Neon** para velocidad de desarrollo

**Razones:**
1. Database branching invaluable para probar Fase 1
2. Bootstrap mode: velocidad > control
3. Free tier suficiente para MVP
4. Puedes migrar después sin dolor (PostgreSQL estándar)

**Plan de transición:**
```
Mes 0-3:  Neon free tier (MVP con perfiles + networking)
Mes 3-6:  Evaluar métricas:
          ├─ Si >10GB datos → Migrar a VPS self-hosted
          ├─ Si <500MB → Seguir en Neon free
          └─ Si revenue >$500/mes → Decidir según ROI
```

**Triggers para migrar a VPS:**
- ✅ >10GB de datos activos
- ✅ Revenue estable >$500/mes (justifica DevOps time)
- ✅ Requerimientos de compliance específicos
- ✅ Necesitas features custom de PostgreSQL

---

## 🛠️ Roadmap Técnico del Ecosistema (ACTUALIZADO)

### ✅ Fase 0: Infraestructura Base (COMPLETADA)
**Duración:** Agosto 2025
**Estado:** ✅ 100% Completado

- [x] VPS Digital Ocean configurado
- [x] Nginx + SSL con Let's Encrypt
- [x] Portainer para gestión Docker
- [x] N8N + PostgreSQL + Redis
- [x] Workflows de scraping Portal Inmobiliario
- [x] Workflows de scraping Mercado Libre
- [x] Backups automatizados
- [x] Documentación en vps-do-docs

**Resultado:** Infraestructura productiva con 7 servicios activos

---

### 🔄 Fase 1: Perfiles de Usuario (EN PROGRESO)
**Duración:** Septiembre-Octubre 2025 (1-2 semanas)
**Prioridad:** ALTA
**Estado:** 🔄 40% Completado

#### ✅ Tareas Completadas:
- [x] Diseño de modelos Prisma (User, Property, Connection)
- [x] Enums para ProfessionType, PropertyType, PropertyStatus
- [x] Schema validado y generado con Prisma

#### 🔄 Tareas en Progreso:
- [ ] **Decisión de Base de Datos** (Neon vs VPS PostgreSQL)
- [ ] Aplicar schema a BD elegida
- [ ] Migración de datos existentes (si aplica)

#### 🔜 Tareas Pendientes:

**Backend (Gabriel):**
- [ ] Crear API endpoints:
  - `GET /api/users/profile` - Obtener perfil actual
  - `PUT /api/users/profile` - Actualizar perfil
  - `GET /api/users/[userId]` - Perfil público
  - `GET /api/properties` - Listar propiedades de usuario
  - `POST /api/properties` - Crear propiedad
  - `PUT /api/properties/[id]` - Editar propiedad
  - `DELETE /api/properties/[id]` - Eliminar propiedad

**Frontend (Mona + Gabriel):**
- [ ] Página `/dashboard/perfil` - Editar mi perfil
  - Formulario con bio, profesión, empresa, contacto
  - Upload de avatar
  - Toggle de perfil público/privado

- [ ] Página `/networking/[userId]` - Perfil público
  - Vista read-only del perfil
  - Listado de propiedades del usuario
  - Botón "Conectar"

- [ ] Sección `/networking/mis-propiedades`
  - CRUD completo de propiedades
  - Upload de imágenes (múltiples)
  - Mapa para seleccionar ubicación
  - Preview de cómo se ve en perfil público

**Integración:**
- [ ] Actualizar navegación del dashboard
- [ ] Testing de flujo completo
- [ ] Documentación de APIs

**Entregables:**
- Sistema funcional de perfiles profesionales
- Usuarios pueden publicar y gestionar propiedades
- Perfiles públicos accesibles vía URL

---

### 🔜 Fase 2: Networking y Conexiones (Oct-Nov 2025)
**Duración:** 2-3 semanas
**Prioridad:** ALTA
**Dependencia:** Fase 1 completada

#### Funcionalidades:

**Sistema de Conexiones:**
- [ ] Enviar solicitudes de conexión
- [ ] Aceptar/rechazar solicitudes
- [ ] Ver lista de mis conexiones
- [ ] Notificaciones de nuevas solicitudes

**Directorio de Profesionales:**
- [ ] Página `/networking` con listado
- [ ] Filtros: región, profesión, servicios
- [ ] Búsqueda por nombre/empresa
- [ ] Vista de grid y lista

**Mensajería Básica:**
- [ ] Chat 1-a-1 entre conexiones
- [ ] Notificaciones de mensajes nuevos
- [ ] Historial de conversaciones

**Foro de Discusión:**
- [ ] Modelo ForumPost, ForumComment
- [ ] Categorías: Tasaciones, Legal, Mercado, Técnico
- [ ] Sistema de likes/votes
- [ ] Moderación básica (admin)

#### Integraciones:
- [ ] N8N workflow: notificaciones de conexión vía email
- [ ] N8N workflow: digest semanal de actividad del foro

---

### 🔜 Fase 3: Blog y Centro de Datos (Nov-Dic 2025)
**Duración:** 2 semanas
**Prioridad:** MEDIA
**Objetivo:** SEO y educación

#### Funcionalidades:

**Blog Sistema:**
- [ ] Modelo BlogPost con MDX support
- [ ] CMS para autores (admin + invited)
- [ ] Sistema de tags y categorías
- [ ] SEO metadata por post
- [ ] Sitemap automático

**Data Stories:**
- [ ] Integración con datos de referenciales
- [ ] Gráficos interactivos (Recharts)
- [ ] Reportes de mercado automatizados (N8N)
- [ ] Export a PDF de análisis

**Contenido Inicial:**
- [ ] 10 posts educativos base
- [ ] 3 data stories sobre mercado Los Ríos
- [ ] Guía completa de tasaciones MOP

---

### 🔜 Fase 4: Sofía - Bot RAG (Dic 2025-Ene 2026)
**Duración:** 3-4 semanas
**Prioridad:** MEDIA-ALTA
**Base:** `/chatbot` existente

#### Mejoras Técnicas:

**RAG Implementation:**
- [ ] Vector DB setup (Supabase pgvector o Pinecone)
- [ ] Embeddings de:
  - Todos los referenciales
  - Posts del blog
  - Documentación legal CBR/SII
  - FAQs

- [ ] Integración Anthropic Claude API
- [ ] Context window optimization
- [ ] Sistema de fuentes/citations

**UX Improvements:**
- [ ] Widget flotante global (todas las páginas)
- [ ] Historial de conversaciones por usuario
- [ ] Modo "Explicación simple" vs "Técnico"
- [ ] Sugerencias contextuales
- [ ] Rate limiting por usuario

**Casos de Uso:**
- "¿Cuál es el precio promedio de casas en Valdivia Centro?"
- "Explica cómo hacer una tasación MOP"
- "¿Qué documentos necesito del CBR para vender?"
- "Muéstrame propiedades similares a [dirección]"

---

### 🔜 Fase 5: CRM Inmobiliario (Feb-Mar 2026)
**Duración:** 4-5 semanas
**Prioridad:** MEDIA
**Target:** Profesionales activos

#### Funcionalidades Core:

**Gestión de Clientes:**
- [ ] Modelos: CrmClient, CrmDeal, CrmNote, CrmTask
- [ ] CRUD completo de clientes
- [ ] Historial de interacciones
- [ ] Sistema de tags personalizados

**Pipeline de Ventas:**
- [ ] Vista Kanban (drag & drop)
- [ ] Etapas customizables
- [ ] Probabilidad de cierre
- [ ] Valor estimado del deal
- [ ] Fecha estimada de cierre

**Automatizaciones:**
- [ ] Tareas automáticas según etapa
- [ ] Recordatorios vía email (N8N)
- [ ] Notificaciones de deals estancados
- [ ] Follow-ups programados

**Reportes:**
- [ ] Dashboard de métricas
- [ ] Tasa de conversión por etapa
- [ ] Valor del pipeline
- [ ] Tiempo promedio de cierre
- [ ] Performance por corredor

**Integraciones:**
- [ ] Conexión con Property model
- [ ] Vincular deals a propiedades
- [ ] N8N workflows para emails automáticos

---

## 💰 Modelo de Monetización Bootstrap (Sin Funding)

### ✅ Revenue Streams Actuales (Mantener)
1. **Tasaciones MOP** - Contratos gubernamentales de expropiación
2. **Tasaciones privadas** - Clientes particulares y empresas
3. **Corretaje tradicional** - Propiedades en venta

### ✅ Nuevos Revenue Streams (Escalables)

#### 1. **Freemium Tasaciones**
- **Free:** Tasaciones básicas automáticas (contribuyendo datos)
- **Pro:** Tasaciones certificadas para bancos/legal ($20.000-50.000 CLP)
- **Enterprise:** API access para bancos/financieras

#### 2. **Suscripciones CRM** (Post Fase 5)
- **Free:** Hasta 10 clientes, pipeline básico
- **Profesional:** $15.000 CLP/mes - Clientes ilimitados + automatizaciones
- **Equipo:** $40.000 CLP/mes - Multi-usuario + reportes avanzados

#### 3. **Data Services B2B**
- Licencias de datos agregados a bancos
- Reports de mercado zona sur ($100.000-300.000 CLP)
- Consultoría en automatización de tasaciones

#### 4. **Featured Listings** (Post Fase 1)
- Propiedades destacadas en perfiles: $5.000 CLP/mes
- Aparecer primero en directorio profesionales: $10.000 CLP/mes

---

## 🎯 Estrategia de Crecimiento de Datos

### Fuentes Principales para `referenciales-cl`:

#### ✅ Ya Implementadas:
1. **Portal Inmobiliario** - Scraping vía N8N
2. **Mercado Libre** - Scraping vía N8N

#### 🔜 Por Implementar:
3. **SII (Servicio Impuestos Internos)** - Apellidos propietarios
4. **CBR Valdivia** - Índice registro propiedad online
5. **Descubro Data** - ROL avalúo, montos, superficie
6. **Crowdsourcing** - Usuarios aportan datos → tasaciones gratuitas

#### Workflow N8N Propuesto:
```
Trigger (diario) →
  ├─ Scrape Portal Inmobiliario
  ├─ Scrape Mercado Libre
  ├─ Scrape yapo.cl (nuevo)
  └─ Consolidar en PostgreSQL
      └─ Geocoding via Google Maps API
          └─ Generar geometría PostGIS
              └─ Trigger notification (Discord/Email)
```

---

## 👥 Estructura de Socios y Organización

### GitHub Organization Setup
- **Nombre organización:** `pp-technologies` o `pantoja-partners`
- **Repositorio actual:** `new-project-nexus-core` (main branch configurada)
- **Repositorio infra:** `vps-do` (VPS management)
- **Repositorio docs:** `vps-do-docs` (documentación viviente)
- **Colaboradores:** Gabriel (Owner/Tech Lead) + Mona (Owner/Product Lead)

### División de Responsabilidades

**Gabriel (Tech Lead):**
- Backend + APIs (Next.js API routes + Prisma)
- Infraestructura VPS (Docker, Nginx, N8N)
- Database management (PostgreSQL/PostGIS)
- Integraciones de datos (SII, CBR, Descubro)
- N8N workflows de scraping y automatización

**Mona (Product Lead):**
- Frontend + UX/UI (Next.js App Router + Tailwind)
- Product management (roadmap, priorización)
- Content strategy (blog, documentación)
- User research (entrevistas con corredores)
- Marketing y comunicación externa

**Conjunto:**
- Arquitectura de producto
- Decisiones estratégicas
- Sesiones Platzi (modo dúo)
- Crecimiento orgánico sin funding

---

## 📚 Plan de Aprendizaje Colaborativo Platzi

*(Mantiene contenido original de V2.0 - no modificado)*

---

## 📊 Métricas de Éxito (6 meses) - Bootstrap Mode

### Métricas de Infraestructura ✅
- [x] VPS operativo 99%+ uptime
- [x] 7 servicios activos y monitoreados
- [x] Backups automatizados funcionando

### Métricas de Datos
- **Objetivo:** 5,000+ propiedades región de Los Ríos
- **Actual:** ~1,000+ (Portal Inmobiliario + Mercado Libre scrapers)
- **Gap:** Implementar CBR + SII + crowdsourcing

### Métricas de Producto (Fase 1-2)
- [ ] **100+ usuarios registrados** con perfiles completos
- [ ] **50+ propiedades listadas** por profesionales
- [ ] **20+ conexiones** activas entre profesionales
- [ ] **5+ posts de blog** con >100 visitas cada uno

### Métricas de Negocio (Conservadoras)
- **Mantener tasaciones MOP** (revenue base actual)
- **$2M+ CLP/mes** revenue total (actual + nuevos streams)
- **3+ clientes B2B** usando datos para reports
- **2+ suscripciones CRM** (post Fase 5)

### Métricas de Aprendizaje
- **80%+ cursos Platzi** completados según cronograma
- **2+ certificaciones** por persona
- **1 demo técnico** funcional para potenciales clientes B2B

---

## 🎯 Próximos Pasos Inmediatos (7 días)

### Gabriel (Enfoque Técnico)

#### 1. **Decisión de Base de Datos** (DÍA 1)
- [ ] Evaluar métricas actuales de datos
- [ ] Decidir: Neon vs VPS PostgreSQL vs Híbrido
- [ ] Crear proyecto en Neon (si se elige esa opción)
- [ ] Aplicar schema Prisma a BD elegida

#### 2. **APIs de Perfil** (DÍAS 2-3)
- [ ] Endpoint GET /api/users/profile
- [ ] Endpoint PUT /api/users/profile
- [ ] Endpoint GET /api/users/[userId]
- [ ] Testing con Postman/curl

#### 3. **APIs de Propiedades** (DÍAS 4-5)
- [ ] CRUD completo de Property
- [ ] Upload de imágenes (Cloudinary o S3)
- [ ] Integración con geocoding

### Mona (Enfoque Frontend + Producto)

#### 1. **Diseño de Perfiles** (DÍAS 1-2)
- [ ] Wireframes de `/dashboard/perfil`
- [ ] Wireframes de `/networking/[userId]`
- [ ] Wireframes de `/networking/mis-propiedades`
- [ ] Prototipo en Figma

#### 2. **Research de Mercado** (DÍAS 3-4)
- [ ] Entrevistas con 5 corredores locales
- [ ] Análisis de competencia (Toctoc, Yapo, Portal Inmobiliario)
- [ ] Definir pricing para featured listings

#### 3. **Setup Profesional** (DÍA 5)
- [ ] Crear LinkedIn como Co-founder P&P Technologies
- [ ] Configurar perfil GitHub
- [ ] Unirse a organización GitHub

### Conjunto

#### 1. **Sesión Estratégica** (SÁBADO - 4 horas)
- [ ] Decidir base de datos final (Neon vs VPS)
- [ ] Definir roadmap detallado Fase 1
- [ ] Asignar tareas específicas por semana
- [ ] Primera sesión Platzi: "Fundamentos y Validación de Ideas"

#### 2. **Setup Operacional** (DOMINGO)
- [ ] Crear GitHub Organization `pp-technologies`
- [ ] Migrar repos a organización
- [ ] Configurar reunión semanal (lunes 9 AM)
- [ ] Setup dashboard de métricas compartido

---

## ❓ Decisiones Pendientes (CRÍTICAS)

### 🔴 Prioridad ALTA (Decidir esta semana):
1. **Base de datos para Fase 1:** Neon vs VPS PostgreSQL vs Híbrido
2. **Nombre definitivo de la plataforma:** Nexus Core vs Urbe Libre vs otros
3. **Pricing modelo freemium:** ¿Cuándo empezar a cobrar?

### 🟡 Prioridad MEDIA (Decidir próximo mes):
4. **Tech stack long-term:** ¿Mantener React/Next.js o migrar?
5. **Storage de imágenes:** Cloudinary vs S3 vs Supabase Storage
6. **Hosting producción:** VPS actual vs Vercel/Netlify para frontend

### 🟢 Prioridad BAJA (Decidir en 3+ meses):
7. **Legal:** ¿Crear nueva empresa o seguir con estructura actual?
8. **Timeline funding:** ¿Cuándo buscar primera ronda?
9. **Mercado expansión:** ¿Solo Valdivia o nacional desde el inicio?

---

## 📈 KPIs de Seguimiento Semanal

### Métricas de Desarrollo
- **Commits al repositorio:** Objetivo 10+/semana
- **Pull requests merged:** Objetivo 2+/semana
- **Tests coverage:** Objetivo 60%+ (post MVP)

### Métricas de Infraestructura
- **VPS uptime:** >99% objetivo
- **Servicios activos:** Mantener 7+
- **Datos scraped:** +200 propiedades/semana

### Métricas de Producto
- **Features completados:** Seguir roadmap
- **Bugs reportados:** Tracking en GitHub Issues
- **User feedback:** Recopilar en cada release

---

## 🔗 Links de Referencia

### Repositorios:
- **Nexus Core:** https://github.com/gabrielpantoja-cl/new-project-nexus-core
- **VPS Management:** (privado - compartir acceso)
- **VPS Docs:** Local en `/vps-do-docs/`

### Servicios Productivos:
- **VPS:** https://167.172.251.27
- **Portainer:** https://167.172.251.27:9443
- **N8N:** http://n8n.gabrielpantoja.cl

### Documentación:
- **VPS Guide:** `/vps-do-docs/guides/vps-guide.md`
- **N8N Guide:** `/vps-do-docs/services/n8n/n8n-guide.md`
- **Scraping Portal:** `/vps-do-docs/projects/portalinmobiliario-complete-guide.md`

---

## 🎉 Logros Recientes (Septiembre 2025)

- ✅ Infraestructura VPS completamente operativa
- ✅ N8N + scraping de 2 portales funcionando
- ✅ Schema Prisma Fase 1 diseñado y validado
- ✅ Repositorio Nexus Core creado y configurado
- ✅ Plan de Trabajo V3 con progreso real documentado
- ✅ Decisión arquitectónica de base de datos evaluada

---

**Siguiente Revisión:** 07 de Octubre, 2025
**Responsable Seguimiento:** Gabriel & Mona (alternando weekly)

---

*Documento viviente - actualizar conforme progresa el proyecto*
