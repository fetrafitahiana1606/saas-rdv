/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
