/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@archivia/shared-types", "@archivia/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // typedRoutes: true, // Disabled for now - enable when routes are stable
  },
};

module.exports = nextConfig;
