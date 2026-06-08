import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/thumbnail/[id]": ["./public/images/prayer-letters/**"],
  },
};

export default nextConfig;
