import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Render counters on the demos count real commits; strict mode's double
  // render would make them misleading.
  reactStrictMode: false,
  compiler: {
    relay: {
      src: "./src",
      artifactDirectory: "./src/__generated__",
      language: "typescript",
      eagerEsModules: true,
    },
  },
};

export default nextConfig;
