import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 오류를 무시 (프로덕션 배포용)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 TypeScript 오류를 무시 (프로덕션 배포용)
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
