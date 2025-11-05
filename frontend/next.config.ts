import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      { source: '/backend/:path*', destination: 'http://192.168.1.11:8080/:path*' },
    ];
  },

};

export default nextConfig;
