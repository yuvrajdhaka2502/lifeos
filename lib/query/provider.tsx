'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  )
  return (
    <QueryClientProvider client={qc}>
      {/* reducedMotion="user": framer drops transform/layout animation (keeps
          opacity) for prefers-reduced-motion users, app-wide (doc 04 §3) */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  )
}
