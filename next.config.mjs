/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
