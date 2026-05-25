import { PrimaryButton } from '../components/PrimaryButton'
import { TopCornerActions } from '../components/TopCornerActions'
import type { CategoryScreenProps } from './types'

export function CategorySelectionScreen({
  theme,
  themeKey,
  onThemeChange,
  onInfo,
  state,
  categories,
  onToggle,
  onSelectAll,
  onClearAll,
  onBack,
  onNext,
}: CategoryScreenProps) {
  const allIds = new Set(categories.map((c) => c.id))
  const allSelected = categories.length > 0 && state.selectedCategoryIds.size === categories.length
  const selectedCount = state.selectedCategoryIds.size

  const buttonText =
    selectedCount === 0
      ? 'Wybierz kategorię'
      : allSelected
        ? 'Dalej • wszystkie kategorie'
        : selectedCount === 1
          ? 'Dalej • 1 kategoria'
          : selectedCount <= 4
            ? `Dalej • ${selectedCount} kategorie`
            : `Dalej • ${selectedCount} kategorii`

  return (
    <div className="screen">
      <TopCornerActions theme={theme} selectedTheme={themeKey} onSelectTheme={onThemeChange} onInfoClick={onInfo} />

      <section className="screen-scroll with-bottom-bar">
        <div className="title-row">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1 className="title">🗂️ Kategorie</h1>
        </div>
        <p className="subtitle">Wybierz co najmniej jedną kategorię</p>

        <button
          className={`category-card ${allSelected ? 'selected' : ''}`}
          style={{ borderColor: allSelected ? theme.secondary : theme.border, background: allSelected ? `${theme.secondary}22` : theme.card }}
          onClick={() => (allSelected ? onClearAll() : onSelectAll())}
        >
          <div>
            <strong>Wszystko</strong>
            <p>Losuj hasła ze wszystkich kategorii.</p>
          </div>
          <span>🎲</span>
        </button>

        {categories.map((category) => {
          const selected = state.selectedCategoryIds.has(category.id)
          return (
            <button
              key={category.id}
              className={`category-card ${selected ? 'selected' : ''}`}
              style={{ borderColor: selected ? theme.secondary : theme.border, background: selected ? `${theme.primary}22` : theme.card }}
              onClick={() => onToggle(category.id)}
            >
              <div>
                <strong>{category.name}</strong>
                <p>{category.description}</p>
              </div>
              <span>{category.emoji}</span>
            </button>
          )
        })}
      </section>

      <footer className="bottom-bar" style={{ background: theme.gradientFrom, borderColor: theme.border }}>
        <PrimaryButton theme={theme} disabled={state.selectedCategoryIds.size === 0 || ![...state.selectedCategoryIds].every((id) => allIds.has(id))} onClick={onNext}>
          {buttonText}
        </PrimaryButton>
      </footer>
    </div>
  )
}
