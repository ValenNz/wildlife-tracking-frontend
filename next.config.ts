import type { NextConfig } from "next";

const legacyModuleRoutes = ["animals", "species", "devices", "geo-zones"];

const legacyEditRoutes = [
  "animals",
  "species",
  "devices",
  "geo-zones",
  "incidents",
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "55mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      ...legacyModuleRoutes.flatMap((module) => [
        {
          source: `/master-data/${module}`,
          destination: `/${module}`,
        },
        {
          source: `/master-data/${module}/:path*`,
          destination: `/${module}/:path*`,
        },
      ]),
      ...legacyEditRoutes.map((module) => ({
        source: `/${module}/:id/update`,
        destination: `/${module}/:id/edit`,
      })),
    ];
  },
};

export default nextConfig;
