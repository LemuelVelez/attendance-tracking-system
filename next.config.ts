import withPWA from "next-pwa"; // Corrected to use 'next-pwa' instead of '@next/pwa'
import { NextConfig } from "next"; // Importing NextConfig type for TypeScript

// Next.js configuration with type annotation
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Add any required domains for images
  },
};

// Apply withPWA to the configuration
const config = withPWA({
  ...nextConfig,
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
});

// Export the final config
export default config;
