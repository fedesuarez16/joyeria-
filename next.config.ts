import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Las fotos se optimizan una sola vez al subirlas (ver src/lib/image.ts),
    // así que se sirven tal cual desde el CDN de Supabase.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qufwkxnkpyznjxkbemhk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
