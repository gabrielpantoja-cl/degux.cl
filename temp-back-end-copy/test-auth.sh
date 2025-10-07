#!/bin/bash

# ==========================================
# 🧪 Script de Test de Autenticación
# ==========================================
# Proyecto: degux.cl
# Descripción: Prueba endpoints de autenticación en producción
# Uso: ./scripts/test-auth.sh [local|vps]
# ==========================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determinar modo
MODE="${1:-vps}"

echo "🧪 Test de Autenticación - degux.cl"
echo "===================================="
echo ""

if [ "$MODE" = "vps" ]; then
  echo "📍 Modo: VPS (Producción)"
  BASE_URL="https://degux.cl"
else
  echo "📍 Modo: Local (Desarrollo)"
  BASE_URL="http://localhost:3000"
fi

echo "🌐 URL Base: $BASE_URL"
echo ""

# Test 1: Health Check
echo "🏥 Test 1: Health Check de la aplicación..."
echo "--------------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Health check OK (HTTP $HTTP_CODE)${NC}"
  HEALTH_DATA=$(curl -s "$BASE_URL/api/health" | jq . 2>/dev/null || echo "{}")
  echo "$HEALTH_DATA" | head -10
else
  echo -e "${RED}❌ Health check FAILED (HTTP $HTTP_CODE)${NC}"
  echo "   La aplicación no está respondiendo correctamente"
fi

echo ""

# Test 2: NextAuth Providers
echo "🔐 Test 2: Verificando proveedores de NextAuth..."
echo "--------------------------------------------------"

PROVIDERS=$(curl -s "$BASE_URL/api/auth/providers" 2>/dev/null || echo "{}")

if echo "$PROVIDERS" | jq -e '.google' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Proveedor Google OAuth configurado${NC}"
  echo "$PROVIDERS" | jq .
else
  echo -e "${RED}❌ Proveedor Google OAuth NO configurado${NC}"
  echo "   Respuesta: $PROVIDERS"
fi

echo ""

# Test 3: NextAuth Session Endpoint
echo "🎫 Test 3: Verificando endpoint de sesión..."
echo "---------------------------------------------"

SESSION=$(curl -s "$BASE_URL/api/auth/session" 2>/dev/null || echo "{}")

if echo "$SESSION" | grep -q "user"; then
  echo -e "${GREEN}✅ Sesión activa detectada${NC}"
  echo "$SESSION" | jq .
else
  echo -e "${YELLOW}⚠️  No hay sesión activa (esperado si no estás logueado)${NC}"
  echo "   Respuesta: $SESSION"
fi

echo ""

# Test 4: Redirección de Dashboard
echo "🔒 Test 4: Verificando protección de Dashboard..."
echo "--------------------------------------------------"

DASHBOARD_REDIRECT=$(curl -s -I "$BASE_URL/dashboard" 2>/dev/null | grep -i "location:" || echo "")

if echo "$DASHBOARD_REDIRECT" | grep -q "/auth/signin"; then
  echo -e "${GREEN}✅ Dashboard protegido correctamente${NC}"
  echo "   Redirige a: /auth/signin"
elif echo "$DASHBOARD_REDIRECT" | grep -q "200"; then
  echo -e "${YELLOW}⚠️  Dashboard accesible sin autenticación${NC}"
  echo "   Middleware podría estar deshabilitado"
else
  echo -e "${BLUE}ℹ️  Dashboard response:${NC}"
  curl -s -I "$BASE_URL/dashboard" | head -5
fi

echo ""

# Test 5: API Pública (sin autenticación)
echo "🌐 Test 5: Verificando API pública..."
echo "--------------------------------------"

PUBLIC_API=$(curl -s "$BASE_URL/api/public/map-config" 2>/dev/null || echo "{}")

if echo "$PUBLIC_API" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API pública funcionando${NC}"
  echo "$PUBLIC_API" | jq . | head -15
else
  echo -e "${YELLOW}⚠️  API pública no responde como se esperaba${NC}"
  echo "   Respuesta: $PUBLIC_API"
fi

echo ""

# Test 6: CORS Headers (solo para VPS)
if [ "$MODE" = "vps" ]; then
  echo "🔗 Test 6: Verificando headers CORS..."
  echo "---------------------------------------"

  CORS_HEADERS=$(curl -s -I -H "Origin: https://pantojapropiedades.cl" "$BASE_URL/api/public/map-data" 2>/dev/null | grep -i "access-control" || echo "")

  if [ ! -z "$CORS_HEADERS" ]; then
    echo -e "${GREEN}✅ Headers CORS configurados${NC}"
    echo "$CORS_HEADERS"
  else
    echo -e "${YELLOW}⚠️  No se detectaron headers CORS${NC}"
  fi

  echo ""
fi

# Test 7: SSL Certificate (solo para VPS)
if [ "$MODE" = "vps" ]; then
  echo "🔒 Test 7: Verificando certificado SSL..."
  echo "------------------------------------------"

  SSL_INFO=$(curl -vI https://degux.cl 2>&1 | grep -E "SSL|TLS|subject:" | head -5)

  if echo "$SSL_INFO" | grep -q "TLS"; then
    echo -e "${GREEN}✅ Certificado SSL válido${NC}"
    echo "$SSL_INFO"
  else
    echo -e "${RED}❌ Problema con certificado SSL${NC}"
  fi

  echo ""
fi

# Test 8: Logs del contenedor (solo para VPS)
if [ "$MODE" = "vps" ]; then
  echo "📜 Test 8: Últimos logs de autenticación..."
  echo "--------------------------------------------"

  echo "Ejecutando en VPS: ssh gabriel@167.172.251.27 'docker logs degux-web --tail 50 2>&1 | grep AUTH'"
  echo ""
  echo "Nota: Debes tener acceso SSH al VPS para ver logs"
  echo ""
fi

# Resumen final
echo "=================================================="
echo "📊 Resumen de Tests:"
echo "=================================================="
echo ""

PASSED=0
FAILED=0

# Health check
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Health Check${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ Health Check${NC}"
  FAILED=$((FAILED + 1))
fi

# Google OAuth
if echo "$PROVIDERS" | jq -e '.google' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Google OAuth Provider${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ Google OAuth Provider${NC}"
  FAILED=$((FAILED + 1))
fi

# API Pública
if echo "$PUBLIC_API" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ API Pública${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ API Pública${NC}"
  FAILED=$((FAILED + 1))
fi

echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Todos los tests pasaron ($PASSED/$((PASSED + FAILED)))${NC}"
  echo ""
  echo "🎉 La autenticación está configurada correctamente"
  echo ""
  echo "🧪 Prueba manual:"
  echo "1. Abre $BASE_URL en el navegador"
  echo "2. Intenta acceder a $BASE_URL/dashboard"
  echo "3. Deberías ser redirigido a login"
  echo "4. Haz login con Google"
  echo "5. Deberías poder acceder al dashboard"
  exit 0
else
  echo -e "${RED}❌ $FAILED tests fallaron${NC}"
  echo ""
  echo "📝 Acciones requeridas:"
  echo "1. Verificar variables de entorno: ./scripts/check-env.sh"
  echo "2. Verificar base de datos: ./scripts/check-db.sh"
  echo "3. Revisar logs del contenedor"
  echo "4. Verificar configuración de Google OAuth"
  exit 1
fi