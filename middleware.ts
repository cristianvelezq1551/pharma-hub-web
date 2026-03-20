/**
 * Middleware de Next.js — protege rutas privadas.
 *
 * El middleware corre en el Edge Runtime (no tiene acceso a Node.js APIs).
 * Equivalente al RouteGuard en Angular o al AuthGuard en Flutter GoRouter.
 *
 * Rutas protegidas: /cart, /checkout, /orders, /profile
 * Rutas públicas: /, /products, /login, /register, /search
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('pharma-web-token')?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Solo protege estas rutas — el catálogo es público
export const config = {
  matcher: ['/cart', '/checkout', '/orders/:path*', '/profile/:path*'],
};
