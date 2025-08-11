    import { NextResponse } from 'next/server';

    export function middleware(request) {
      const isAuthenticated = request.cookies.get('isAuthenticated')?.value;

      if (!isAuthenticated && request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    }

    export const config = {
      matcher: ['/dashboard', '/create-quotation'],
    };
    
