import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ["omega-wallet.s3.us-east-2.amazonaws.com"],
    // For newer Next.js versions, use remotePatterns instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'omega-wallet.s3.us-east-2.amazonaws.com',
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Build WILL continue even with TS errors
  },
  
};

export default nextConfig;