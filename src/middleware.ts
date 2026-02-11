import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const authObj = await auth();
    await authObj.protect();
  }
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  // Bypass Clerk only for static files (Clerk auth() requires middleware to run for pages)
  const path = req.nextUrl.pathname;
  if (path === '/manifest.json' || path === '/vercel.ico') {
    return NextResponse.next();
  }
  return clerkHandler(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
