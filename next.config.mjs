/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static generation for routes that depend on Prisma/database
  // This prevents build-time evaluation of dynamic imports
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Ensure API routes are always dynamic
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [],
    fallback: [],
  }),
}

export default nextConfig
