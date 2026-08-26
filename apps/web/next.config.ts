import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // GitHub Codespaces serves the dev app through an *.app.github.dev origin.
  // Next.js dev-server origin protection otherwise rejects requests from the
  // forwarded browser origin even though localhost:3000 works.
  allowedDevOrigins: ["*.app.github.dev"],
};

export default nextConfig;
