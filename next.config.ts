import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force clean builds
  cleanDistDir: true,

  // Redirect .html extensions to clean URLs
  async redirects() {
    return [
      {
        source: '/verify-member.html',
        destination: '/verify-member',
        permanent: true,
      },
      {
        source: '/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
