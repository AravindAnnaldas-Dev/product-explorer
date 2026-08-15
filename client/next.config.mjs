/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // remotePatterns instead of a wide-open domains list: restricts
    // next/image optimization to the mock API's image host only.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
