'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/shared/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { Category, Product } from '@/lib/types';
import { SlidersHorizontal } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const qParam = searchParams.get('q');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params: { categoryId: categoryParam || undefined } }),
        api.get('/categories'),
      ]);
      let prods: Product[] = prodRes.data;
      if (qParam) {
        const q = qParam.toLowerCase();
        prods = prods.filter((p) =>
          p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
        );
      }
      setProducts(prods);
      setCategories(catRes.data);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, qParam]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={18} className="text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">
          {qParam ? `Resultados para "${qParam}"` : 'Catálogo'}
        </h1>
        {!loading && (
          <span className="text-sm text-gray-400 ml-auto">{products.length} productos</span>
        )}
      </div>

      {/* Filtros por categoría */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/products"
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            !categoryParam ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              categoryParam === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otro filtro o búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
