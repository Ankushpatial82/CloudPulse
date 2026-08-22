/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* calls to the Express backend — avoids CORS in production
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5002"}/api/:path*`,
      },
    ];
  },
  // Suppress certain TS/ESLint errors during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
