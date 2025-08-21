import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimisations pour Vercel
  output: 'standalone',
  
  // Gestion des images externes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Optimisations de performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Headers pour Vercel
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },

  // Redirection pour éviter les 404
  async redirects() {
    return [
      {
        source: '/',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
