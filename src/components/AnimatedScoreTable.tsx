// Tabela wyników po rundzie (odpowiednik ui/components/AnimatedScoreTable.kt): najpierw kolejność sprzed rundy,
// potem punkty „nabijają się” i gracze przesuwają się na nowe miejsca.

import { useEffect, useState } from 'react'
import { PlayerAvatar } from '../avatars/PlayerAvatar'
import type { AvatarMood } from '../avatars/characters'
import { formatPoints, formatPointsDelta } from '../game/scoring'
import type { Player } from '../game/types'

const ROW_H = 62
const COUNT_MS = 900

type Props = {
  players: Player[]
  pointsDelta: Record<string, number>
  moods: Record<string, AvatarMood>
  /** false = stan sprzed rundy, true = animacja do nowych wyników. */
  play: boolean
}

const byScore = (list: Player[], score: (p: Player) => number) =>
  list
    .map((p, i) => ({ p, i }))
    .sort((a, b) => score(b.p) - score(a.p) || a.i - b.i)
    .map(({ p }) => p.id)

function useProgress(active: boolean, durationMs: number): number {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setProgress(1 - (1 - t) * (1 - t))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, durationMs])
  return active ? progress : 0
}

export function AnimatedScoreTable({ players, pointsDelta, moods, play }: Props) {
  const progress = useProgress(play, COUNT_MS)
  const before = (p: Player) => p.score - (pointsDelta[p.id] ?? 0)
  const order = progress >= 0.5 ? byScore(players, (p) => p.score) : byScore(players, before)

  return (
    <div className="score-table animated" style={{ height: players.length * ROW_H }}>
      {players.map((player) => {
        const delta = pointsDelta[player.id] ?? 0
        const shown = before(player) + delta * progress
        const deltaClass = delta > 0 ? 'plus' : delta < 0 ? 'minus' : 'zero'
        return (
          <div
            className="score-row"
            key={player.id}
            style={{ transform: `translateY(${order.indexOf(player.id) * ROW_H}px)` }}
          >
            <div className="score-left">
              <span className="score-avatar">
                <PlayerAvatar avatar={player.avatarEmoji} size={44} mood={play ? moods[player.id] : 'idle'} />
              </span>
              <span className="score-name">{player.name}</span>
            </div>
            <div className="score-right">
              <span className={`score-delta ${deltaClass} ${play ? 'shown' : ''}`}>{formatPointsDelta(delta)}</span>
              <span className="score-points">{formatPoints(Math.round(shown * 2) / 2)} pkt</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
