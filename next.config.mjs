/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore face-api.js during build if not installed (optional dependency)
    config.resolve.alias = {
      ...config.resolve.alias,
      'face-api.js': false,
    };
    
    // Exclude better-sqlite3 and Node.js modules from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      config.externals = config.externals || [];
      config.externals.push('better-sqlite3');
    }
    
    return config;
  },
}

export default nextConfig