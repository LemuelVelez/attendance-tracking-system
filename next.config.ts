import { NextConfig } from "next"; // Importing NextConfig type for TypeScript

// Define the Next.js configuration
const nextConfig: NextConfig = {
  reactStrictMode: true, // Ensure React Strict Mode is enabled
  images: {
    domains: ["mdbcdn.b-cdn.net"], // Allow this domain for image loading
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Export the configuration
export default nextConfig;
