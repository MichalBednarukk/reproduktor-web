// Odpowiednik fitAvatarSize z ui/avatar/AvatarGroups.kt.

/**
 * Największy avatar (od `max` w dół, co 4 px, min. 40 px), przy którym `count` avatarów w zawijanych
 * wierszach mieści się w `width` × `height`.
 */
export function fitAvatarSize(count: number, width: number, height: number, max = 100, hGap = 16, vGap = 8): number {
  for (let size = max; size > 40; size -= 4) {
    const cols = Math.max(1, Math.floor((width + hGap) / (size + hGap)))
    const rows = Math.ceil(count / cols)
    if (rows * size + (rows - 1) * vGap <= height) return size
  }
  return 40
}
