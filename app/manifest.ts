import type { MetadataRoute } from 'next'

/** F8 — PWA manifest (doc 07 §8). Served at /manifest.webmanifest; what makes
 *  "Add to Home Screen" install a standalone dark app instead of a bookmark. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LifeOS',
    short_name: 'LifeOS',
    description: 'Personal life-operations dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#0A0A0F',
    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
