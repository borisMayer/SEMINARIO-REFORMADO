import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'bmayer.rojel@gmail.com';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes: require admin email
    if (pathname.startsWith('/admin')) {
      if (token?.email !== ADMIN_EMAIL) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/cursos/:path*'],
};
