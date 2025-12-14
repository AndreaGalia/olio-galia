import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-9a7992c9b54b4970ba58b0c563f17084.r2.dev',
        port: '',
        pathname: '/**',
      },
      // Pattern generico per tutti i bucket R2
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
