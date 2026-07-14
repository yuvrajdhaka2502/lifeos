'use client'
import { motion } from 'framer-motion'
import { useId } from 'react'

type Props = {
  pct: number // 0–100
  size?: number
  stroke?: number
  from: string // gradient start (track color)
  to: string // gradient end (track accent)
  children?: React.ReactNode // center content
}

/** Animated circular progress with the track's gradient (doc 04 §2 — progress
 *  shown as rings; animates previous → new value). */
export function ProgressRing({ pct, size = 56, stroke = 5, from, to, children }: Props) {
  const gradId = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped / 100) }}
          transition={{ type: 'spring', stiffness: 60, damping: 16 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold tabular-nums">
        {children ?? `${Math.round(clamped)}%`}
      </div>
    </div>
  )
}
