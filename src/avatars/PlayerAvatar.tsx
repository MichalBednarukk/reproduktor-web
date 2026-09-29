// Avatar gracza: animowana postać (SVG) albo emotka. Odpowiednik ui/avatar/PlayerAvatar.kt.
//
// Spoczynek: oddychanie, mruganie, rozglądanie się, bujanie ręką z rekwizytem.
// Mina (mood) zmienia twarz i odtwarza ruch: happy — podskoki, sneaky — przechylenie głowy,
// caught — trzęsienie, win — skoki i machanie, sad — oklapnięcie. loop = powtarzaj ruch (zwycięzca).

import { useEffect, useMemo, useRef } from 'react'
import { CHARACTER_VIEWBOX, FACES, characterSvg, type AvatarMood } from './characters'

type Props = {
  avatar: string
  size: number
  mood?: AvatarMood
  loop?: boolean
}

export function PlayerAvatar({ avatar, size, mood = 'idle', loop = false }: Props) {
  const svg = characterSvg(avatar)
  if (!svg) {
    return (
      <span className="avatar-emoji" style={{ width: size, height: size, fontSize: size * 0.78 }} aria-hidden="true">
        {avatar}
      </span>
    )
  }
  return <CharacterAvatar svg={svg} size={size} mood={mood} loop={loop} />
}

type Parts = {
  svg: SVGSVGElement
  body: SVGGElement
  head: SVGGElement
  armR: SVGGElement
  accessory: SVGGElement | null
  lids: SVGGElement[]
  pupils: SVGGElement[]
}

const LOOP_INTERVAL_MS = 2600

function CharacterAvatar({ svg, size, mood, loop }: { svg: string; size: number; mood: AvatarMood; loop: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const partsRef = useRef<Parts | null>(null)
  const moodRef = useRef(mood)
  const markup = useMemo(() => ({ __html: svg }), [svg])
  const unit = size / CHARACTER_VIEWBOX.size

  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  // Przygotowanie SVG + animacje spoczynkowe
  useEffect(() => {
    const host = hostRef.current
    const el = host?.querySelector('svg')
    if (!host || !el) return
    const { x, y, size: vb } = CHARACTER_VIEWBOX
    el.setAttribute('viewBox', `${x} ${y} ${vb} ${vb}`)
    el.setAttribute('width', '100%')
    el.setAttribute('height', '100%')
    el.style.overflow = 'visible'

    const q = <T extends Element>(id: string) => el.querySelector<T>(`[id="${id}"]`)
    const pivot = (id: string) => {
      const c = q<SVGCircleElement>('pivot_' + id)
      return c ? `${c.getAttribute('cx')}px ${c.getAttribute('cy')}px` : 'center'
    }
    const prep = (id: string, pivotId = id) => {
      const g = q<SVGGElement>(id)
      if (g) {
        g.style.transformBox = 'view-box'
        g.style.transformOrigin = pivot(pivotId)
      }
      return g
    }

    const armR = prep('arm_R')!
    const accessoryEl = q<SVGGElement>('accessory')
    // Rekwizyt poza ręką obraca się razem z nią (wokół barku).
    const accessory = accessoryEl && !armR.contains(accessoryEl) ? prep('accessory', 'arm_R') : null
    const parts: Parts = {
      svg: el,
      body: prep('body')!,
      head: prep('head')!,
      armR,
      accessory,
      lids: ['L', 'R'].map((s) => prep('eyelid_' + s)!),
      pupils: ['L', 'R'].map((s) => q<SVGGElement>('pupil_' + s)!),
    }
    partsRef.current = parts

    if (prefersReducedMotion()) return

    const idle: Animation[] = []
    idle.push(
      parts.body.animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.015, 0.975)' }], {
        duration: 1400,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
        delay: -Math.random() * 1400,
      }),
    )
    const sway = [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(4deg)' }]
    const swayTiming: KeyframeAnimationOptions = { duration: 1800, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: -Math.random() * 1800 }
    idle.push(armR.animate(sway, swayTiming))
    if (accessory) idle.push(accessory.animate(sway, swayTiming))

    let blinkTimer = 0
    const blink = () => {
      for (const lid of parts.lids) {
        lid.setAttribute('display', 'inline')
        lid.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 180 }).onfinish = () =>
          lid.setAttribute('display', 'none')
      }
      blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 2500)
    }
    blinkTimer = window.setTimeout(blink, 600 + Math.random() * 2500)

    const spots: Array<[number, number]> = [[0, 0], [8, 2], [-8, 2], [0, -6], [6, -4]]
    const lookTimer = window.setInterval(() => {
      if (FACES[moodRef.current].pupil) return
      const [dx, dy] = spots[Math.floor(Math.random() * spots.length)]
      movePupils(parts, dx, dy, 300)
    }, 1700 + Math.random() * 600)

    return () => {
      window.clearTimeout(blinkTimer)
      window.clearInterval(lookTimer)
      idle.forEach((a) => a.cancel())
    }
  }, [markup])

  // Mina + ruch reakcji
  useEffect(() => {
    const parts = partsRef.current
    const root = rootRef.current
    if (!parts || !root) return
    const face = FACES[mood]
    setFace(parts, face.mouth, face.brow)
    movePupils(parts, ...(face.pupil ?? [0, 0]), 250)

    const running: Animation[] = []
    const play = () => {
      running.splice(0).forEach((a) => a.cancel())
      if (!prefersReducedMotion()) running.push(...playMotion(mood, parts, root, unit))
    }
    play()
    const loopTimer = loop && mood !== 'idle' ? window.setInterval(play, LOOP_INTERVAL_MS) : 0
    return () => {
      window.clearInterval(loopTimer)
      running.forEach((a) => a.cancel())
    }
  }, [mood, loop, unit, markup])

  return (
    <div className="avatar-character" ref={rootRef} style={{ width: size, height: size }} aria-hidden="true">
      <div className="avatar-svg" ref={hostRef} dangerouslySetInnerHTML={markup} />
    </div>
  )
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function setFace(parts: Parts, mouth: string, brow: string) {
  parts.svg.querySelectorAll('[id="mouths"] > g').forEach((g) => g.setAttribute('display', g.id === `mouth_${mouth}` ? 'inline' : 'none'))
  for (const side of ['L', 'R']) {
    parts.svg
      .querySelectorAll(`[id="brow_${side}"] > g`)
      .forEach((g) => g.setAttribute('display', g.id === `brow_${side}_${brow}` ? 'inline' : 'none'))
  }
}

function movePupils(parts: Parts, dx: number, dy: number, duration: number) {
  parts.pupils.forEach((p) =>
    p.animate([{ transform: `translate(${dx}px, ${dy}px)` }], { duration, fill: 'forwards', easing: 'ease-out' }),
  )
}

/** Ruch dla miny. Ruch całej postaci (skoki, trzęsienie) idzie na element HTML, żeby nie był przycinany. */
function playMotion(mood: AvatarMood, parts: Parts, root: HTMLElement, unit: number): Animation[] {
  const px = (v: number) => `${v * unit}px`
  switch (mood) {
    case 'happy':
      return [
        root.animate(
          [
            { transform: 'translateY(0)' },
            { transform: `translateY(${px(-40)}) scale(1.02, 0.98)` },
            { transform: 'translateY(0) scale(1.05, 0.95)' },
            { transform: 'translateY(0)' },
          ],
          { duration: 600, iterations: 2, easing: 'ease-out' },
        ),
      ]
    case 'sneaky':
      return [
        parts.head.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg) translateX(-6px)' }], {
          duration: 400,
          fill: 'forwards',
          easing: 'ease-out',
        }),
      ]
    case 'caught':
      return [
        root.animate([0, -14, 12, -10, 8, -5, 3, 0].map((x) => ({ transform: `translateX(${px(x)})` })), { duration: 600 }),
        parts.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.92, 1.06)' }, { transform: 'scale(1)' }], {
          duration: 300,
          composite: 'add',
        }),
      ]
    case 'win': {
      const wave = [{ transform: 'rotate(0)' }, { transform: 'rotate(-35deg)' }, { transform: 'rotate(0)' }]
      const result = [
        root.animate(
          [{ transform: 'translateY(0)' }, { transform: `translateY(${px(-60)}) rotate(-4deg)` }, { transform: 'translateY(0)' }],
          { duration: 500, iterations: 3, easing: 'ease-in-out' },
        ),
        parts.armR.animate(wave, { duration: 500, iterations: 3, composite: 'add' }),
      ]
      if (parts.accessory) result.push(parts.accessory.animate(wave, { duration: 500, iterations: 3, composite: 'add' }))
      return result
    }
    case 'sad':
      return [
        parts.body.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04, 0.9)' }], {
          duration: 500,
          fill: 'forwards',
          easing: 'ease-out',
          composite: 'add',
        }),
        parts.head.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(5deg)' }], { duration: 500, fill: 'forwards', easing: 'ease-out' }),
      ]
    default:
      return []
  }
}
