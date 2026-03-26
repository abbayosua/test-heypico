import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview
  allowedDevOrigins: [
    'preview-chat-ab93828a-64a1-47c4-a199-58d6150153ae.space.z.ai',
  ],
};

export default nextConfig;
