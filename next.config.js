/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,


  // Standalone output is handled by Netlify plugin v5
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'tqskjoufozgyactjnrix.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '51.112.209.149',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME || process.env.BUILD_TIME || new Date().toISOString(),
  },

  // Webpack configuration for Supabase and other libraries
  webpack: (config, { isServer }) => {
    // Fix for Supabase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ensure path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };

    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  trailingSlash: false,

  // Redirects for SPA compatibility
  async redirects() {
    return [];
  },

  // Rewrites for API proxy
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
