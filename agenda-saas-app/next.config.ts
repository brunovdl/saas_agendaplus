import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/agenda',
        permanent: true,
      },
      {
        source: '/analytics',
        destination: '/agenda',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
