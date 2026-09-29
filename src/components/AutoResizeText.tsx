// Odpowiednik AutoResizeText z RevealRoleScreen.kt / PassPhoneScreen.kt:
// zmniejsza czcionkę o 2px, dopóki tekst nie mieści się w maxLines, nie mniej niż minFontSize.

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

type Props = {
  text: string
  maxFontSize: number
  minFontSize: number
  maxLines: number
  lineHeightMultiplier: number
  className?: string
  style?: CSSProperties
}

export function AutoResizeText({ text, maxFontSize, minFontSize, maxLines, lineHeightMultiplier, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState(maxFontSize)
  const [prevText, setPrevText] = useState(text)

  if (prevText !== text) {
    setPrevText(text)
    setFontSize(maxFontSize)
  }

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || fontSize <= minFontSize) return
    const maxHeight = maxLines * fontSize * lineHeightMultiplier + 1
    if (el.scrollHeight > maxHeight || el.scrollWidth > el.clientWidth + 1) {
      setFontSize(Math.max(minFontSize, fontSize - 2))
    }
  }, [fontSize, minFontSize, maxLines, lineHeightMultiplier, text])

  return (
    <div
      ref={ref}
      className={`auto-resize ${className ?? ''}`}
      style={{
        ...style,
        fontSize,
        lineHeight: `${fontSize * lineHeightMultiplier}px`,
        WebkitLineClamp: maxLines,
      }}
    >
      {text || '?'}
    </div>
  )
}
