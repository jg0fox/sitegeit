import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/pipeline', destination: '/businesses', permanent: true },
      { source: '/pipeline/:id', destination: '/businesses/:id', permanent: true },
      { source: '/clients', destination: '/businesses', permanent: true },
      { source: '/clients/:id', destination: '/businesses/:id', permanent: true },
      { source: '/clients/:id/edit-site', destination: '/businesses/:id/edit-site', permanent: true },
    ]
  },
}

export default nextConfig
