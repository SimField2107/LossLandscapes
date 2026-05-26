import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",

  turbopack: {
    rules: {
      "*.vert": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.frag": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
