import { NextRequest, NextResponse } from 'next/server';

export const middleware = (request: NextRequest) => {
    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/login';
    const token = request.cookies.get('token')?.value || request.cookies.get('next-auth.session-token')?.value || '';

    // Si el usuario está autenticado y trata de acceder a /login, redirigir a la página de inicio
    if (isPublicPath && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Si el usuario no está autenticado y trata de acceder a una página protegida, redirigir a /login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Permitir el acceso a la página solicitada
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
    ]
}