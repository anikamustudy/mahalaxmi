/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optional: Reduce bundle size
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
};

module.exports = nextConfig;
