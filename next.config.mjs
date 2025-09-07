/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
      {
        protocol: "https",
        hostname: "**.ufs.sh", // Allow all ufs.sh subdomains (UploadThing)
      },
      {
        protocol: "https",
        hostname: "u8ombuwywmnulg03.public.blob.vercel-storage.com", // ✅ Allow images from this host
        pathname: "/*",
      },
    ],
  },
  rewrites: () => {
    return [
      { source: "/icons/Music.png", destination: "/icons/Headphones.png" },
      {
        source: "/hashtag/:tag",
        destination: "/search?q=%23:tag",
      },
    ];
  },
};

export default nextConfig;
