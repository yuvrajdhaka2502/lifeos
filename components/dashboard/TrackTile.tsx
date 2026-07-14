'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProgressRing } from './ProgressRing'

export type TileStat = { label: string; value: string }

export type TileData = {
  href: string
  name: string
  from: string // gradient start
  to: string // gradient end
  pct: number // progress ring value
  ringLabel?: string // ring center override (defaults to pct%)
  headline: string // hero stat — oversized tabular numerals
  sub?: string // secondary line under the headline
  stats?: TileStat[] // small bottom row (e.g. hours today / week Σ)
  strip?: (string | null)[] // 7 colored dots (diet satisfaction); null = unlogged
}

/** F1 — one dashboard tile: glass card, track-gradient ring, hero stat.
 *  Tap → the track page. 2-col grid on phone (locked decision, doc 04). */
export function TrackTile({ tile }: { tile: TileData }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link
        href={tile.href}
        className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-card p-4 transition hover:border-accent/60"
      >
        {/* faint track-gradient sheen (doc 04 §2) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] transition group-hover:opacity-[0.12]"
          style={{ background: `linear-gradient(135deg, ${tile.from}, ${tile.to})` }}
        />
        <div className="relative flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium">{tile.name}</p>
            <p className="mt-1 truncate font-mono text-lg font-semibold tabular-nums">{tile.headline}</p>
            {tile.sub && <p className="mt-0.5 truncate text-xs text-muted">{tile.sub}</p>}
          </div>
          <ProgressRing pct={tile.pct} from={tile.from} to={tile.to}>
            {tile.ringLabel}
          </ProgressRing>
        </div>

        {tile.stats && tile.stats.length > 0 && (
          <div className="relative mt-3 flex gap-4 border-t border-border pt-2.5">
            {tile.stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <p className="font-mono text-sm font-semibold tabular-nums">{s.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {tile.strip && (
          <div className="relative mt-3 flex gap-1.5 border-t border-border pt-2.5">
            {tile.strip.map((color, i) => (
              <span
                key={i}
                className="h-2 flex-1 rounded-full"
                style={{ background: color ?? 'var(--border)' }}
              />
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  )
}
