import type { Category, SecretWord, WordsPayload } from './types'

export async function loadWords(): Promise<{ categories: Category[]; wordsByCategory: Record<string, SecretWord[]> }> {
  const url = `${import.meta.env.BASE_URL}reproduktor_words_v3.min.json`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Nie udało się wczytać bazy haseł.')
  }

  const data = (await response.json()) as WordsPayload
  const categories = data.categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    emoji: c.emoji,
  }))

  const wordsByCategory: Record<string, SecretWord[]> = {}
  for (const category of data.categories) {
    wordsByCategory[category.id] = category.words
      .filter((w) => w.id && w.word)
      .map((w) => ({
        id: w.id,
        word: w.word,
        categoryId: category.id,
        hints: (w.hints ?? []).map((h) => h.trim()).filter(Boolean),
        difficulty: w.difficulty ?? 'easy',
      }))
  }

  return { categories, wordsByCategory }
}

export function pickWord(
  selectedCategoryIds: Set<string>,
  usedWordIds: Set<string>,
  wordsByCategory: Record<string, SecretWord[]>,
): SecretWord | null {
  const pool = [...selectedCategoryIds].flatMap((id) => wordsByCategory[id] ?? [])
  if (pool.length === 0) {
    return null
  }

  const unused = pool.filter((w) => !usedWordIds.has(w.id))
  const source = unused.length > 0 ? unused : pool
  return source[Math.floor(Math.random() * source.length)] ?? null
}
