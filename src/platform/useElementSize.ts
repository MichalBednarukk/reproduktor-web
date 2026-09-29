// Rozmiar elementu (ResizeObserver) — odpowiednik BoxWithConstraints na Androidzie.
// Zwraca [funkcję do podpięcia jako ref, rozmiar]: const [measure, size] = useElementSize(); <div ref={measure}>.

import { useEffect, useState } from 'react'

export function useElementSize<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [setElement, size] as const
}
