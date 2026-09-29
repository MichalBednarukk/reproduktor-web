// Lista z przestawianiem kolejności przeciąganiem za uchwyt (☰). Odpowiednik Androida:
// ReorderablePlayerList w PlayersScreen.kt. Działa palcem, myszką i strzałkami ↑/↓ na uchwycie;
// przy krawędzi przewijanego kontenera lista sama się przewija.

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

type Props<T> = {
  items: T[]
  keyOf: (item: T) => string
  onMove: (from: number, to: number) => void
  renderItem: (item: T, handle: ReactNode, dragging: boolean) => ReactNode
  handleLabel: (item: T) => string
}

type Drag = {
  index: number
  pointerId: number
  startY: number
  startScroll: number
  clientY: number
  scroll: number
  /** Środki wierszy (w układzie listy) i odstęp między kolejnymi wierszami. */
  mids: number[]
  slot: number
}

const EDGE_PX = 70
const SCROLL_STEP = 12

export function ReorderableList<T>({ items, keyOf, onMove, renderItem, handleLabel }: Props<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Array<HTMLDivElement | null>>([])
  const [drag, setDrag] = useState<Drag | null>(null)

  const scroller = () => listRef.current?.closest<HTMLElement>('.scroll-area') ?? null
  const offsetOf = (d: Drag) => d.clientY - d.startY + (d.scroll - d.startScroll)

  function targetIndex(d: Drag) {
    const center = d.mids[d.index] + offsetOf(d)
    let target = d.index
    while (target < d.mids.length - 1 && center > d.mids[target + 1]) target++
    while (target > 0 && center < d.mids[target - 1]) target--
    return target
  }

  // Autoprzewijanie przy krawędzi podczas przeciągania
  useEffect(() => {
    if (!drag) return
    let frame = 0
    const tick = () => {
      const el = scroller()
      if (el) {
        const rect = el.getBoundingClientRect()
        let delta = 0
        if (drag.clientY < rect.top + EDGE_PX) delta = -SCROLL_STEP
        else if (drag.clientY > rect.bottom - EDGE_PX) delta = SCROLL_STEP
        if (delta) {
          const before = el.scrollTop
          el.scrollTop += delta
          if (el.scrollTop !== before) setDrag((d) => (d ? { ...d, scroll: el.scrollTop } : d))
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [drag])

  const start = (index: number) => (e: PointerEvent<HTMLButtonElement>) => {
    const rows = rowRefs.current.slice(0, items.length)
    if (rows.some((r) => !r)) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const mids = rows.map((r) => r!.offsetTop + r!.offsetHeight / 2)
    const slot = rows.length > 1 ? rows[1]!.offsetTop - rows[0]!.offsetTop : rows[0]!.offsetHeight
    const scroll = scroller()?.scrollTop ?? 0
    setDrag({ index, pointerId: e.pointerId, startY: e.clientY, clientY: e.clientY, startScroll: scroll, scroll, mids, slot })
  }

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    setDrag({ ...drag, clientY: e.clientY })
  }

  const end = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag || e.pointerId !== drag.pointerId) return
    const to = targetIndex(drag)
    setDrag(null)
    if (to !== drag.index) onMove(drag.index, to)
  }

  const keyMove = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      onMove(index, index - 1)
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault()
      onMove(index, index + 1)
    }
  }

  const target = drag ? targetIndex(drag) : -1

  return (
    <div className="reorder-list" ref={listRef}>
      {items.map((item, index) => {
        const dragging = drag?.index === index
        let shift = 0
        if (drag && !dragging) {
          if (drag.index < index && index <= target) shift = -drag.slot
          else if (target <= index && index < drag.index) shift = drag.slot
        }
        const style = dragging
          ? { transform: `translateY(${offsetOf(drag)}px) scale(1.03)`, zIndex: 2, transition: 'none' }
          : { transform: shift ? `translateY(${shift}px)` : undefined }
        const handle = (
          <button
            type="button"
            className="icon-btn drag-handle"
            aria-label={handleLabel(item)}
            onPointerDown={start(index)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={keyMove(index)}
          >
            ☰
          </button>
        )
        return (
          <div
            key={keyOf(item)}
            ref={(el) => {
              rowRefs.current[index] = el
            }}
            className={`reorder-row ${dragging ? 'dragging' : ''}`}
            style={style}
          >
            {renderItem(item, handle, dragging)}
          </div>
        )
      })}
    </div>
  )
}
