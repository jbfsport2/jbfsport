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

    // Redirection pour éviter les 404

}

export default nextConfig
