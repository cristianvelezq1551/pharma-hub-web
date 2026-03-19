# Pharma Hub — Web Usuario Final

Tienda online de farmacia para usuarios finales. Permite navegar el catálogo sin login y comprar con cuenta registrada.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Library | shadcn/ui + Tailwind CSS |
| Estado global | Zustand |
| Fetching | TanStack Query (React Query) |
| Formularios | React Hook Form + Zod |
| WebSocket | Socket.io-client (notif. estado de pedido) |
| Autenticación | JWT en httpOnly cookies |
| Despliegue | Vercel |

## Instalación

```bash
git clone https://github.com/cristianvelezq1551/pharma-hub-web.git
cd pharma-hub-web
npm install
cp .env.example .env.local
npm run dev
```

## Variables de entorno

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx              # Root layout (navbar pública, footer)
│   ├── page.tsx                # Home (productos destacados, categorías)
│   ├── products/
│   │   ├── page.tsx            # Catálogo completo con filtros
│   │   └── [id]/page.tsx       # Detalle de producto
│   ├── categories/
│   │   └── [slug]/page.tsx     # Productos por categoría
│   ├── search/
│   │   └── page.tsx            # Resultados de búsqueda
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (private)/              # Requiere login
│       ├── cart/page.tsx       # Carrito
│       ├── checkout/page.tsx   # Confirmar compra
│       ├── orders/page.tsx     # Historial de pedidos
│       └── profile/page.tsx   # Perfil y wallet
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── catalog/                # ProductCard, CategoryGrid, SearchBar
│   ├── cart/                   # CartDrawer, CartItem, CartSummary
│   ├── checkout/               # OrderSummary, PaymentConfirm
│   └── layout/                 # Navbar, Footer, MobileMenu
├── hooks/
├── lib/
├── stores/
└── types/
```

## Skills instalados

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```
