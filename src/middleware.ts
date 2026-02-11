import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    if (!isPublicRoute(req)) {
      const authObj = await auth();
      await authObj.protect();
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
