# Guía de Desarrollo — Pharma Hub Web Usuario Final

---

## Diferencia clave con el Admin Panel

El web de usuario final tiene dos modos:
- **Modo público**: navegar catálogo, buscar, ver detalle de productos → sin login requerido
- **Modo privado**: carrito, compra, historial → requiere login

Esto lo maneja Next.js con route groups y middleware:
```
app/
├── page.tsx              # Pública: home
├── products/             # Pública: catálogo
├── (auth)/              # Auth: login / registro
└── (private)/           # Privada: cart, orders, profile
    └── middleware.ts    # Redirige a /login si no hay sesión
```

---

## Conceptos de UX del ecommerce

### Navbar persistente
- Logo (de la configuración del tenant vía API)
- Barra de búsqueda
- Ícono de carrito con contador de ítems (badge)
- Login / Avatar del usuario

### Flujo de compra
```
Catálogo → Detalle producto → [Agregar al carrito]
                                      ↓
                               Carrito (drawer lateral)
                                      ↓
                               Checkout (resumen + confirmar)
                                      ↓
                             Confirmación de orden
```

Si el usuario intenta agregar al carrito **sin login**:
→ Mostrar modal "Para comprar necesitas iniciar sesión" con botón de login

---

## Orden de implementación (Learning Path)

### Fase 1: Catálogo público (Semana 1)

**1. Home page**

Aprenderás:
- **Static Site Generation (SSG)**: Next.js pre-renderiza la página en build time
- Los productos destacados se renderizan en el servidor → excelente SEO
- Revalidación periódica (`revalidate: 3600`) para mostrar cambios sin rebuild

```typescript
// app/page.tsx — Server Component con ISR
async function HomePage() {
  const featured = await fetchFeaturedProducts();
  const categories = await fetchCategories();
  return (
    <>
      <HeroBanner />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featured} />
    </>
  );
}

export const revalidate = 3600; // Revalidar cada hora
```

**¿Por qué ISR y no CSR aquí?**
En un ecommerce, el SEO de las páginas de producto es crítico para aparecer en Google. El Server-Side Rendering asegura que los bots puedan leer el contenido.

---

**2. Catálogo con filtros** `/products`

Aprenderás:
- `searchParams` en Next.js App Router para filtros en URL (`/products?category=vitaminas&page=2`)
- Grid responsive de tarjetas de producto
- Skeleton loading (placeholder visual mientras carga)
- Infinite scroll o paginación

Estructura de URL de búsqueda:
```
/products?category=vitaminas&q=vitamina+c&page=1&sort=price_asc
```
Cada parámetro es leído desde `searchParams` en el Server Component.

---

**3. Detalle de producto** `/products/[id]`

Aprenderás:
- Dynamic routes en Next.js
- `generateMetadata()` para SEO dinámico (título, descripción por producto)
- Galería de imágenes
- Selector de cantidad
- Mostrar precio original y precio con descuento si aplica
- Badge "Requiere receta médica" si `requiresCertificate` es true

```typescript
// Precio con descuento
function PriceDisplay({ price, discount }) {
  const finalPrice = discount
    ? price * (1 - discount / 100)
    : price;

  return (
    <div>
      {discount && <span className="line-through text-gray-400">${price}</span>}
      <span className="text-2xl font-bold">${finalPrice.toFixed(2)}</span>
      {discount && <Badge>-{discount}%</Badge>}
    </div>
  );
}
```

---

**4. Búsqueda** `/search`

Aprenderás:
- Debounce del input de búsqueda (no hace request en cada tecla, espera 300ms)
- `useSearchParams` hook del cliente
- Actualizar URL sin recargar página (`router.push`)

---

### Fase 2: Autenticación (Semana 2)

**5. Login y Registro**

Mismo patrón que el Admin Panel:
- React Hook Form + Zod
- JWT en httpOnly cookie
- Redirect después de login a la página de origen (parámetro `callbackUrl`)

```typescript
// Redirigir al usuario donde intentaba ir antes del login
const callbackUrl = searchParams.get('callbackUrl') ?? '/';
router.push(callbackUrl);
```

---

### Fase 3: Carrito y compra (Semana 2-3)

**6. Carrito** `/cart`

El carrito tiene dos capas:
1. **Estado local** (Zustand): respuesta inmediata al usuario
2. **Sincronización con API**: persistencia entre dispositivos

```typescript
// stores/cart.store.ts
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  total: number;
  savedAmount: number; // Cuánto ahorró con descuentos
}
```

**CartDrawer**: panel lateral que aparece al agregar un producto, sin salir de la página actual (como hacen Amazon y Mercado Libre).

**Resumen del carrito:**
```
Producto A (x2)           $10.00
Producto B (x1) -15%      $8.50  ~~$10.00~~
─────────────────────────────────
Subtotal                  $18.50
Ahorraste                 -$1.50
Total                     $18.50
```

---

**7. Checkout** `/checkout`

Aprenderás:
- Flujo de múltiples pasos con estado local
- Verificación de saldo antes de confirmar
- Upload de certificado médico si algún producto lo requiere
- Confirmación con Dialog de "¿Confirmar compra?"
- Manejo de error si saldo insuficiente

Pasos del checkout:
```
1. Revisión del pedido (productos + cantidades)
2. Si hay productos con certificado → subir imagen/PDF
3. Resumen final + saldo disponible
4. Confirmar → llamar POST /orders
5. Página de éxito con número de orden
```

---

**8. Historial de pedidos** `/orders`

Aprenderás:
- Lista de órdenes con estado visual (badges de colores)
- Detalle expandible de cada orden
- **WebSocket**: actualización en tiempo real del estado del pedido

```typescript
// Escuchar cambios de estado del pedido
useEffect(() => {
  socket.on(`order:${orderId}:status`, (newStatus) => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    toast(`Tu pedido está: ${statusLabels[newStatus]}`);
  });
}, [orderId]);
```

---

**9. Perfil y Wallet** `/profile`

Aprenderás:
- Formulario de edición de perfil con preview de avatar
- Saldo actual destacado visualmente
- Historial de recargas y compras (movimientos del wallet)

---

### Fase 4: Personalización (Marca Blanca)

**10. Aplicar configuración del tenant**

Al cargar la app, se hace un request a `GET /customization` para obtener:
- Logo → usar como `<Image>` en Navbar
- Color primario → inyectar en CSS variables

```typescript
// app/layout.tsx
async function RootLayout({ children }) {
  const config = await fetchCustomization();
  return (
    <html style={{
      '--color-primary': config.primaryColor,
      '--color-secondary': config.secondaryColor,
    }}>
      <body>
        <Navbar logo={config.logoUrl} />
        {children}
      </body>
    </html>
  );
}
```

Tailwind con CSS variables:
```css
/* globals.css */
:root {
  --color-primary: #2563eb; /* default, se sobreescribe por API */
}
.bg-primary { background-color: var(--color-primary); }
```

---

## Diferencias de SEO con el Admin Panel

| | Admin Panel | Web Usuario |
|---|---|---|
| SEO importante | No (requiere login) | Sí (catálogo público) |
| Rendering | CSR (client-side) | SSG/ISR para catálogo, CSR para privado |
| Open Graph | No necesario | Sí, por producto (imagen, precio, nombre) |

```typescript
// Metadata dinámica por producto (para compartir en redes)
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);
  return {
    title: `${product.name} — Pharma Hub`,
    description: product.description,
    openGraph: {
      images: [product.imageUrl],
    },
  };
}
```
