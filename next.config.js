/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['recharts'],
  },

  async redirects() {
    return [
      // Redirect www → non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.mini-gigs-hub.space',
          },
        ],
        destination: 'https://mini-gigs-hub.space/:path*',
        permanent: true,
      },
      // Redirect HTTP → HTTPS
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://mini-gigs-hub.space/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
