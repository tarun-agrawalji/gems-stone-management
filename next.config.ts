import type { NextConfig } from "next";
import path from "path";
import fs from "fs";



const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
