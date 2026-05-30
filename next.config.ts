import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "tesseract.js", "pdfjs-dist"],
};

export default nextConfig;
