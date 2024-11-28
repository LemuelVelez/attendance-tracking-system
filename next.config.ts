import { NextConfig } from "next"; // Importing NextConfig type for TypeScript

// Define the Next.js configuration
const nextConfig: NextConfig = {
  reactStrictMode: true, // Ensure React Strict Mode is enabled
  images: {
    domains: ["example.com"], // Specify allowed image domains
  },
};

// Export the configuration
export default nextConfig;
