import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/@:username/support", destination: "/:username/support" },
      { source: "/@:username/widget", destination: "/:username/widget" },
      { source: "/@:username", destination: "/:username" },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "givemesometokens.dev"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
