import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker multi-stage
  outputFileTracingRoot: join(__dirname, "../../"),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.commercetools.com" }],
  },
};

export default nextConfig;
