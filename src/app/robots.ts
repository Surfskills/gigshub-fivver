import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://yourdomain.com');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'],
      },
      { userAgent: 'GPTBot', allow: '/', disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'] },
      { userAgent: 'Claude-Web', allow: '/', disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/dashboard/', '/api/', '/sign-in', '/sign-up'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
