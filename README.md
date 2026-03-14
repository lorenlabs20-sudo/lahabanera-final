# FINCA LA HABANERA - Sistema Web Completo

## ESTRUCTURA

```
lahabanera-final/
├── cms/          # Panel de Administracion (Next.js) - Puerto 3000
├── portal/       # Sitio Web Publico (Astro) - Puerto 3001
└── README.md
```

---

## INSTALACION RAPIDA

### 1. Requisitos
- Node.js 20+ (descargar de nodejs.org)
- Bun recomendado (mas rapido)

### 2. Instalar CMS

```bash
cd cms

# Instalar dependencias
bun install

# Crear base de datos
bun run db:push

# Cargar datos de ejemplo
bunx tsx prisma/seed.ts

# Iniciar servidor
bun run dev
```

**Abrir:** http://localhost:3000/admin/login

**Credenciales:**
- Email: admin@lahabanera.com
- Password: Habanera2025!

---

### 3. Instalar Portal (en otra terminal)

```bash
cd portal

# Instalar dependencias
bun install

# Iniciar servidor
bun run dev
```

**Abrir:** http://localhost:3001

---

## PUERTOS

| Proyecto | Puerto | URL |
|----------|--------|-----|
| CMS | 3000 | http://localhost:3000/admin |
| Portal | 3001 | http://localhost:3001 |

---

## FUNCIONES CMS

- Dashboard con estadisticas
- Gestion de productos
- Gestion de categorias
- Galeria de imagenes
- Sistema de reservas
- Bandeja de mensajes
- Configuracion de contacto

---

## CONTACTO

**Finca La Habanera**
- Km 38-1/2, Carretera Central, San Pedro, Mayabeque, Cuba
- WhatsApp: +53 5 3972047
- Email: lahaban3ra@gmail.com
# lahabanera-final
