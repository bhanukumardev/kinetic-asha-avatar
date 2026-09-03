import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Asha - Kinetic Age AI Companion for Senior Wellness',
    short_name: 'Asha',
    description:
      'Daily mobility check-ins, guided seated exercises, and WhatsApp wellness reports for seniors and their families.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFC',
    theme_color: '#2E7D32',
    lang: 'en-IN',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      {
        src: '/asha-avatar.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/asha-avatar.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
