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
    // Ignore face-api.js and better-sqlite3 during build
    config.resolve.alias = {
      ...config.resolve.alias,
      'face-api.js': false,
      'better-sqlite3': false,
    };
    
    // Exclude better-sqlite3 and Node.js modules from client-side bundling
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
      };
      config.externals = config.externals || [];
      config.externals.push('better-sqlite3');
    }
    
    return config;
  },
}

export default nextConfig