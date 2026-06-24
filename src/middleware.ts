import { NextRequest, NextResponse } from 'next/server';

// Protected routes and their required roles
const PROTECTED: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/admin(\/|$)/, roles: ['admin'] },
  { pattern: /^\/seller(\/|$)/, roles: ['seller', 'admin'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedRule = PROTECTED.find(rule => rule.pattern.test(pathname));
  if (!matchedRule) return NextResponse.next();

  // Read role from cookie set at login (see AuthContext)
  const role = req.cookies.get('desi-cart-role')?.value;

  if (!role || !matchedRule.roles.includes(role)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*'],
};
