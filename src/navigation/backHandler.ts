// Odpowiednik androidowego BackHandler.
// Systemowy „wstecz” (przycisk/gest na telefonie, przycisk przeglądarki) oraz Esc w dialogach
// trafiają do handlera na szczycie stosu. Dialogi mają wyższy priorytet niż ekrany.
// Gdy nikt nie obsłuży „wstecz”, strona cofa się naprawdę (jak wyjście z aplikacji na Androidzie).

import { useEffect, useRef } from 'react'

export const BACK_PRIORITY_SCREEN = 0
export const BACK_PRIORITY_DIALOG = 1

type Entry = { id: number; priority: number; handler: () => void }

const stack: Entry[] = []
let nextId = 0
let armed = false

function top(minPriority = -Infinity): Entry | undefined {
  let best: Entry | undefined
  for (const entry of stack) {
    if (entry.priority < minPriority) continue
    if (!best || entry.priority > best.priority || (entry.priority === best.priority && entry.id > best.id)) {
      best = entry
    }
  }
  return best
}

function arm() {
  history.pushState({ reproduktorBackGuard: true }, '')
  armed = true
}

export function installBackHandling() {
  if (armed) return
  arm()
  window.addEventListener('popstate', () => {
    const entry = top()
    if (entry) {
      arm()
      entry.handler()
    } else {
      armed = false
      history.back()
    }
  })
  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    const entry = top(BACK_PRIORITY_DIALOG)
    if (entry) {
      event.preventDefault()
      entry.handler()
    }
  })
}

export function useBackHandler(handler: () => void, enabled = true, priority = BACK_PRIORITY_SCREEN) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!enabled) return
    const entry: Entry = { id: nextId++, priority, handler: () => handlerRef.current() }
    stack.push(entry)
    return () => {
      const index = stack.indexOf(entry)
      if (index >= 0) stack.splice(index, 1)
    }
  }, [enabled, priority])
}
