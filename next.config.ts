import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["iyzipay"],
  /** Next 15: yalnızca `false` veya nesne; `true` geçersiz. */
  devIndicators: false,
  /**
   * Webpack disk önbelleğini kapatır. Windows’ta bozuk önbekle sık sık
   * `Cannot find module './5611.js'` veya eksik vendor-chunks hatasına yol açıyordu.
   * Build biraz yavaşlar; karşılığında chunk tutarlılığı artar.
   */
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      { protocol: "https", hostname: "images.clerk.dev", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/**" },
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/**" },
      { protocol: "https", hostname: "uploadthing.com", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;

