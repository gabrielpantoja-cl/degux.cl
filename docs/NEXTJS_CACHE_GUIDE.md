# Guía de Caché de Next.js en Producción

## Problema Identificado

Next.js cachea páginas estáticas por **31536000 segundos (1 año)** en producción por defecto. Esto significa que después de hacer deploy, los usuarios pueden seguir viendo la versión antigua de la página.

## Diagnóstico del Problema

```bash
# Verificar headers de cache
curl -I https://degux.cl/
# Resultado:
# x-nextjs-cache: HIT
# Cache-Control: s-maxage=31536000
```

## Soluciones

### Solución 1: Revalidación Automática (ISR - Incremental Static Regeneration)

Agregar `revalidate` a las páginas que cambian frecuentemente:

```typescript
// src/app/page.tsx
export const revalidate = 3600; // Revalidar cada 1 hora

export default function Page() {
  // ...
}
```

**Tiempos de revalidación recomendados:**
- Homepage (`/`): `3600` (1 hora)
- Documentación (`/docs`): `86400` (1 día)
- Dashboard: No aplicar (es dinámico)
- API Pública: `300` (5 minutos)

### Solución 2: On-Demand Revalidation

Invalidar caché manualmente después del deploy:

```bash
# En el workflow de GitHub Actions, agregar:
curl -X POST https://degux.cl/api/revalidate?secret=${{ secrets.REVALIDATE_SECRET }}&path=/
```

Crear el endpoint:

```typescript
// src/app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const path = searchParams.get('path');

  // Verificar secreto
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: 'Missing path' }, { status: 400 });
  }

  try {
    // Revalidar la ruta específica
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
```

### Solución 3: Forzar Rebuild y Clear Cache

Cuando hagas cambios significativos en producción:

```bash
# SSH al VPS
ssh gabriel@167.172.251.27

# Ir al directorio del proyecto
cd ~/degux.cl

# Eliminar cache y rebuild
rm -rf .next/cache
npm run build

# Reiniciar PM2
npx pm2 restart degux-app
```

### Solución 4: Dynamic Rendering

Para páginas que NUNCA deberían cachearse:

```typescript
// src/app/page.tsx
export const dynamic = 'force-dynamic';

export default function Page() {
  // Esta página se renderizará en cada request
}
```

## Configuración Actual del Proyecto

### Páginas con Caché Problemático

1. **Homepage (`/`)** - Cachea por 1 año
2. **Docs (`/docs`)** - Cachea por 1 año

### Páginas Sin Problema

1. **Dashboard** - Son dinámicas, no se cachean
2. **APIs** - No se cachean

## Recomendación para Deployment Workflow

Actualizar `.github/workflows/deploy-production.yml` para incluir:

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    port: 22
    script: |
      cd /home/gabriel/degux.cl
      git pull origin main
      npm ci
      npm run prisma:generate

      # Eliminar caché de Next.js antes de rebuild
      rm -rf .next/cache

      npm run build
      npx pm2 restart degux-app --update-env
      npx pm2 save

      # Esperar a que el servidor esté listo
      sleep 5

      # Verificar que el servidor responde
      curl -f http://localhost:3000 || echo "Warning: Server not responding"
```

## Verificación Post-Deployment

```bash
# 1. Verificar que el build incluye los cambios
ssh gabriel@167.172.251.27 "cd ~/degux.cl && grep -r 'Explorar API' .next/server/"

# 2. Verificar headers de cache
curl -I https://degux.cl/

# 3. Verificar contenido servido
curl -s https://degux.cl/ | grep "Explorar API"
```

## Notas Importantes

1. **Cloudflare**: Si usas Cloudflare, también necesitas purgar su caché
2. **Browser Cache**: Los usuarios pueden necesitar hard refresh (`Ctrl + Shift + R`)
3. **Build en VPS**: El VPS tiene 4GB RAM, builds muy grandes pueden fallar por falta de memoria

## Troubleshooting

### Problema: Página antigua sigue visible después de deploy

```bash
# 1. Verificar que el código está actualizado
ssh gabriel@167.172.251.27 "cd ~/degux.cl && git log -1 --oneline"

# 2. Verificar que el build se completó
ssh gabriel@167.172.251.27 "cd ~/degux.cl && ls -lah .next/BUILD_ID"

# 3. Eliminar cache y rebuild
ssh gabriel@167.172.251.27 "cd ~/degux.cl && rm -rf .next/cache && npm run build && npx pm2 restart degux-app"
```

### Problema: Build falla por falta de memoria

```bash
# Ver memoria disponible
ssh gabriel@167.172.251.27 "free -h"

# Si falla, el build de GitHub Actions ya validó el código
# Solo hacer git pull y usar el build existente
```

## Referencias

- [Next.js Data Fetching and Caching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
- [Incremental Static Regeneration](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Revalidating Data](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating)
