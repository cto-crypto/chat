

const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "*.supabase.co" },
      { hostname: "ui-avatars.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
