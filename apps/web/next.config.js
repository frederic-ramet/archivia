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
  webpack: (config, { isServer }) => {
    // Ignore README.md files in node_modules
    config.module.rules.push({
      test: /README\.md$/,
      type: "asset/resource",
      generator: {
        emit: false,
      },
    });

    // Externalize libsql for server-side to avoid bundling issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("libsql");
    }

    return config;
  },
};

module.exports = nextConfig;
