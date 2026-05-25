import type { Category, SecretWord, WordsPayload } from './types'

export async function loadWords(): Promise<{ categories: Category[]; wordsByCategory: Record<string, SecretWord[]> }> {
  const url = `${import.meta.env.BASE_URL}reproduktor_words_v3.min.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Nie udało się wczytać bazy haseł')
  const data = (await res.json()) as WordsPayload
  const categories = data.categories.map((c) => ({ id: c.id, name: c.name, description: c.description, emoji: c.emoji }))
  const wordsByCategory: Record<string, SecretWord[]> = {}
  for (const c of data.categories) {
    wordsByCategory[c.id] = c.words.map((w) => ({ id: w.id, word: w.word, categoryId: c.id, hints: (w.hints ?? []).filter(Boolean), difficulty: w.difficulty ?? 'easy' }))
  }
  return { categories, wordsByCategory }
}

export function pickWord(selectedCategoryIds: Set<string>, usedWordIds: Set<string>, wordsByCategory: Record<string, SecretWord[]>): SecretWord | null {
  const pool = [...selectedCategoryIds].flatMap((id) => wordsByCategory[id] ?? [])
  const unused = pool.filter((w) => !usedWordIds.has(w.id))
  const target = unused.length ? unused : pool
  return target[Math.floor(Math.random() * target.length)] ?? null
}

