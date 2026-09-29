// Nagrody na koniec gry (odpowiednik ui/components/AwardsList.kt).

import { PlayerAvatar } from '../avatars/PlayerAvatar'
import { formatPoints } from '../game/scoring'
import type { Award } from '../game/awards'

export function AwardsList({ awards }: { awards: Award[] }) {
  return (
    <div className="awards">
      {awards.map((award, i) => (
        <div key={award.id} className="award" style={{ animationDelay: `${1200 + i * 250}ms` }}>
          <span className="award-emoji">{award.emoji}</span>
          <div className="award-body">
            <strong className="award-title">{award.title}</strong>
            <span className="award-description">
              {award.description} ({award.unit === 'pkt' ? `${formatPoints(award.value)} pkt` : `${award.value}×`})
            </span>
            <div className="award-winners">
              {award.winners.map((p) => (
                <span key={p.id} className="avatar-chip">
                  <PlayerAvatar avatar={p.avatarEmoji} size={60} mood={award.id === 'blunder' ? 'caught' : 'happy'} />
                  <span className="award-name">{p.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
