// Podium 1-2-3 na koniec gry (odpowiednik ui/components/Podium.kt). Remisy stoją na tym samym stopniu.
// Wielkość avatarów i szerokość stopni wynikają z dostępnej szerokości — nic nie wychodzi poza ekran.

import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { formatPoints } from '../game/scoring'
import type { Player } from '../game/types'
import { useElementSize } from '../platform/useElementSize'

const STEP_H = [96, 68, 48]
const MEDALS = ['🥇', '🥈', '🥉']
const PERSON_GAP = 4
const COLUMN_GAP = 8
const MIN_COLUMN = 64

type Fit = { size: number; perRow: number }

/** Gracze pogrupowani wg miejsc (remis = to samo miejsce), maks. 3 stopnie. */
function podiumPlaces(players: Player[]): Player[][] {
  const scores = [...new Set(players.map((p) => p.score))].sort((a, b) => b - a).slice(0, 3)
  return scores.map((s) => players.filter((p) => p.score === s))
}

const columnWidth = (fit: Fit) => Math.max(MIN_COLUMN, fit.perRow * fit.size + (fit.perRow - 1) * PERSON_GAP)

/** Najpierw zmniejszamy avatary, a gdy spadną poniżej 44 px — zawijamy remisy w wiersze. */
function fitPodium(groups: Array<{ place: number; count: number }>, width: number): Fit[] {
  for (let cap = 3; cap >= 1; cap--) {
    const natural = groups.map(({ place, count }) => ({
      size: (place === 0 ? 130 : 96) * (count > 1 ? 0.75 : 1),
      perRow: Math.min(count, cap),
    }))
    const total = natural.reduce((sum, f) => sum + columnWidth(f), 0) + COLUMN_GAP * (groups.length - 1)
    const scale = Math.min(1, width / total)
    const fitted = natural.map((f) => ({ ...f, size: f.size * scale }))
    if (fitted.every((f) => f.size >= 44) || cap === 1) return fitted.map((f) => ({ ...f, size: Math.max(40, f.size) }))
  }
  return []
}

export function Podium({ players }: { players: Player[] }) {
  const [measure, box] = useElementSize<HTMLDivElement>()
  const places = podiumPlaces(players)
  // Kolejność na ekranie: 2. miejsce, 1., 3.
  const layout = [1, 0, 2].filter((i) => i < places.length)
  const fits = box.width > 0 ? fitPodium(layout.map((place) => ({ place, count: places[place].length })), box.width) : []

  return (
    <div className="podium" ref={measure}>
      {fits.length > 0 &&
        layout.map((place, i) => {
          const group = places[place]
          const fit = fits[i]
          const size = Math.round(fit.size)
          return (
            <div
              key={place}
              className={`podium-col place-${place + 1}`}
              style={{ animationDelay: `${(2 - place) * 350}ms`, width: columnWidth(fit) }}
            >
              <div className={`podium-people ${place === 0 ? 'jump' : ''}`} style={{ maxWidth: fit.perRow * size + (fit.perRow - 1) * PERSON_GAP }}>
                {group.map((p) => (
                  <div key={p.id} className="podium-person" style={{ width: Math.max(size, group.length === 1 ? MIN_COLUMN : size) }}>
                    <PlayerAvatar avatar={p.avatarEmoji} size={size} mood={place === 0 ? 'win' : 'happy'} loop={place === 0} />
                    <span className="podium-name">{p.name}</span>
                  </div>
                ))}
              </div>
              <div className="podium-step" style={{ height: STEP_H[place] }}>
                <span className="podium-medal">{MEDALS[place]}</span>
                <span className="podium-points">{formatPoints(group[0].score)} pkt</span>
              </div>
            </div>
          )
        })}
    </div>
  )
}
