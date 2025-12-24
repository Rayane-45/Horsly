/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ['recharts'],
  experimental: {
    optimizePackageImports: ['recharts'],
  },
  basePath: '/Horsly',
  assetPrefix: '/Horsly/',
}

export default nextConfig
