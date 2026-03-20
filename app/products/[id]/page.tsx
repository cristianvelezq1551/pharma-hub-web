'use client';

/**
 * Detalle de producto — ruta dinámica /products/[id].
 *
 * En Next.js App Router, los parámetros de ruta llegan como `params.id`.
 * En Flutter con GoRouter sería context.pathParameters['id'].
 */
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, AlertTriangle, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { api, imageUrl } from '@/lib/api';
import { formatPrice, getFinalPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCart, openDrawer } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => toast.error('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?callbackUrl=/products/${id}`);
      return;
    }
    try {
      setAdding(true);
      await api.post('/cart', { productId: id, quantity });
      const { data } = await api.get('/cart');
      setCart(data);
      openDrawer();
      toast.success('Agregado al carrito');
    } catch {
      toast.error('No se pudo agregar al carrito');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const finalPrice = getFinalPrice(product.price, product.discount);
  const img = imageUrl(product.imageUrl);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6 -ml-2">
        <ArrowLeft size={16} className="mr-1" /> Volver
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="h-80 md:h-96 bg-white rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.name} className="h-full w-full object-contain p-4" />
          ) : (
            <Package size={64} className="text-gray-200" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-600 font-medium">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{product.name}</h1>
          </div>

          {/* Precio */}
          <div>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(finalPrice)}</p>
            {product.discount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-400 line-through text-lg">{formatPrice(product.price)}</p>
                <Badge className="bg-red-500 hover:bg-red-500">-{product.discount}%</Badge>
              </div>
            )}
          </div>

          {/* Requiere receta */}
          {product.requiresCertificate && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700 text-sm">
              <AlertTriangle size={16} />
              <span>Este producto requiere receta médica al momento de la entrega</span>
            </div>
          )}

          {/* Descripción */}
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          <p className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-gray-500'}`}>
            {product.stock === 0 ? 'Sin stock' : `${product.stock} unidades disponibles`}
            {product.stock > 0 && product.stock <= 5 && ' — ¡Últimas unidades!'}
          </p>

          {/* Cantidad + Agregar */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium text-gray-900 min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>
              <Button size="lg" onClick={handleAddToCart} disabled={adding} className="flex-1">
                <ShoppingCart size={18} className="mr-2" />
                {adding ? 'Agregando...' : 'Agregar al carrito'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
