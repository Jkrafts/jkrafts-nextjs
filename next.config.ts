import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export (written to out/): there is no Node server, so no
  // API routes and no on-demand image optimisation. The contact form posts
  // straight to the Laravel API (NEXT_PUBLIC_LARAVEL_API_URL).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
