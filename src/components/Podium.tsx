// Podium 1-2-3 na koniec gry (odpowiednik ui/components/Podium.kt). Remisy stoją na tym samym stopniu.

import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { formatPoints } from '../game/scoring'
import type { Player } from '../game/types'

const STEP_H = [96, 68, 48]
const MEDALS = ['🥇', '🥈', '🥉']

/** Gracze pogrupowani wg miejsc (remis = to samo miejsce), maks. 3 stopnie. */
function podiumPlaces(players: Player[]): Player[][] {
  const scores = [...new Set(players.map((p) => p.score))].sort((a, b) => b - a).slice(0, 3)
  return scores.map((s) => players.filter((p) => p.score === s))
}

export function Podium({ players }: { players: Player[] }) {
  const places = podiumPlaces(players)
  // Kolejność na ekranie: 2. miejsce, 1., 3.
  const layout = [1, 0, 2].filter((i) => i < places.length)
  return (
    <div className="podium">
      {layout.map((place) => {
        const group = places[place]
        const size = (place === 0 ? 130 : 96) / (group.length > 2 ? 2.2 : group.length === 2 ? 1.6 : 1)
        return (
          <div
            key={place}
            className={`podium-col place-${place + 1}`}
            style={{ animationDelay: `${(2 - place) * 350}ms`, flexGrow: Math.min(group.length, 3), maxWidth: 150 * Math.min(group.length, 3) }}
          >
            <div className={`podium-people ${place === 0 ? 'jump' : ''}`}>
              {group.map((p) => (
                <div key={p.id} className="podium-person">
                  <PlayerAvatar avatar={p.avatarEmoji} size={Math.max(60, Math.round(size))} mood={place === 0 ? 'win' : 'happy'} loop={place === 0} />
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
