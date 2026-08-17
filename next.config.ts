import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GSAP timelines get stuck mid-tween under React Strict Mode's dev-only
  // double-effect invocation (gsap.context().revert() races with the second
  // mount). Production builds never double-invoke regardless of this flag.
  reactStrictMode: false,
  serverExternalPackages: ["@prisma/client", "@libsql/client"],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
