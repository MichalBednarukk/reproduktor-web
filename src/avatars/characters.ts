// Postacie (animowane avatary) i ich miny. Odpowiednik ui/avatar/AvatarCharacters.kt na Androidzie.
// Pliki SVG w ./svg/ są kopiowane z folderu AVATAR/ przez scripts/sync_avatars.py — nie edytuj ich ręcznie.

const files = import.meta.glob<string>('./svg/*.svg', { query: '?raw', import: 'default', eager: true })

const SVG_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.replace(/^.*\/(.+)\.svg$/, '$1'), svg]),
)

/** Id dostępnych postaci, np. ['pierozek']. */
export const CHARACTER_IDS = Object.keys(SVG_BY_ID).sort()

export const isCharacter = (avatar: string) => avatar in SVG_BY_ID
export const characterSvg = (avatar: string): string | undefined => SVG_BY_ID[avatar]

export type AvatarMood = 'idle' | 'happy' | 'sneaky' | 'caught' | 'win' | 'sad'

type Face = { mouth: string; brow: 'idle' | 'angry' | 'worried'; pupil: [number, number] | null }

/** Wygląd twarzy dla każdej miny (pupil null = źrenice rozglądają się same). */
export const FACES: Record<AvatarMood, Face> = {
  idle: { mouth: 'idle', brow: 'idle', pupil: null },
  happy: { mouth: 'happy', brow: 'idle', pupil: [0, -4] },
  sneaky: { mouth: 'sneaky', brow: 'angry', pupil: [12, 4] },
  caught: { mouth: 'caught', brow: 'worried', pupil: [0, 0] },
  win: { mouth: 'win', brow: 'angry', pupil: [0, -8] },
  sad: { mouth: 'sad', brow: 'worried', pupil: [-4, 10] },
}

/** Kadr postaci w układzie 512×512 (kwadrat obejmujący sylwetkę i cień). */
export const CHARACTER_VIEWBOX = { x: 20, y: 50, size: 472 }
