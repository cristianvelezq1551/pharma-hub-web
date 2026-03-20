'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Pill, LogOut, User, Package } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function Navbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { itemCount, openDrawer } = useCartStore();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar error — limpiar de todas formas
    }
    clearAuth();
    document.cookie = 'pharma-web-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    toast.success('Sesión cerrada');
    router.push('/');
  };

  const count = itemCount();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Pill size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 hidden sm:block">Pharma Hub</span>
        </Link>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar medicamentos..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="hidden sm:flex">
            Buscar
          </Button>
        </form>

        {/* Carrito */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={user ? openDrawer : () => router.push('/login')}
        >
          <ShoppingCart size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Button>

        {/* Auth */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">{user.name.split(' ')[0]}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Link href="/profile" className="flex items-center gap-2 w-full">
                  <User size={15} /> Mi perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/orders" className="flex items-center gap-2 w-full">
                  <Package size={15} /> Mis pedidos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center gap-2">
                <LogOut size={15} /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login" className={cn(buttonVariants({ size: 'sm' }))}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </header>
  );
}
