import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Izinkan next/image mengoptimasi logo perusahaan yang di-upload ke
    // Supabase Storage (bucket company-logos) — tanpa ini, next/image
    // menolak gambar dari domain luar demi keamanan.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nteatwvbkgbtkyasrhyh.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;