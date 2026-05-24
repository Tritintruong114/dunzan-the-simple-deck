import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  /**
   * Card art is served from `public/` as PNG at display resolution.
   * Cards use native `<img>` (not next/image) for iOS 15 / legacy Safari.
   */
  images: {
    unoptimized: true,
    qualities: [75, 82],
  },
};

export default nextConfig;
