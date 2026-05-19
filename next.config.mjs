import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  /**
   * Card art is already served from `public/` at display resolution.
   * Skipping the default `/_next/image` pipeline avoids first-hit Sharp work
   * (noticeable in dev and on cold serverless) while keeping `next/image` layout.
   */
  images: {
    unoptimized: true,
    qualities: [75, 82],
  },
};

export default nextConfig;
