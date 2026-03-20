/**
 * Home Page — Server Component con ISR (Incremental Static Regeneration).
 *
 * Los datos se obtienen en el servidor en build time y se revalidan cada hora.
 * Esto es crucial para SEO: Google puede leer el contenido sin ejecutar JS.
 *
 * En Flutter no existe SSR/SSG — todo se carga en cliente.
 * Aquí Next.js pre-renderiza el HTML completo antes de enviarlo al browser.
 */
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { ProductCard } from '@/components/shared/product-card';
import type { Category, Product } from '@/lib/types';

// Revalida la página cada hora sin necesidad de rebuild
export const revalidate = 3600;

async function getHomeData() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${base}/products`, { next: { revalidate: 3600 } }),
      fetch(`${base}/categories`, { next: { revalidate: 3600 } }),
    ]);
    const products: Product[] = productsRes.ok ? await productsRes.json() : [];
    const categories: Category[] = categoriesRes.ok ? await categoriesRes.json() : [];
    return { products: products.slice(0, 8), categories };
  } catch {
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getHomeData();

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Tu farmacia de confianza,<br />siempre disponible
          </h1>
          <p className="text-blue-100 mb-6 text-lg">
            Medicamentos, vitaminas y más. Con entrega rápida y segura.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/products" className="inline-flex items-center justify-center rounded-lg bg-white text-blue-700 font-medium px-5 h-10 text-sm hover:bg-blue-50 transition-colors">
              Ver catálogo <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg border border-white text-white font-medium px-5 h-10 text-sm hover:bg-white/10 transition-colors">
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Truck, title: 'Entrega rápida', desc: 'Recibe tu pedido en casa' },
          { icon: ShieldCheck, title: 'Calidad garantizada', desc: 'Productos 100% originales' },
          { icon: Clock, title: 'Atención 24/7', desc: 'Estamos siempre disponibles' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías</h2>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                {cat.name}
                {cat._count && <span className="ml-1 text-gray-400">({cat._count.products})</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      {products.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Productos disponibles</h2>
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Ver todos <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
