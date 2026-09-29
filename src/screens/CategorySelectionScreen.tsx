// Odpowiednik CategorySelectionScreen.kt.

import { AppBackground, BackArrow, BottomBar, PrimaryButton, SecondaryButton, Spacer } from '../components/Basics'
import { TopCornerActions } from '../components/TopCornerActions'
import { useBackHandler } from '../navigation/backHandler'
import type { ScreenProps } from './types'

export function CategorySelectionScreen({ game, theme, onSelectTheme, openRules }: ScreenProps) {
  const { categories, wordsStatus } = game
  const selectedIds = game.state.selectedCategoryIds
  const selectedCount = selectedIds.size
  const isAllSelected =
    categories.length > 0 && selectedCount === categories.length && categories.every((c) => selectedIds.has(c.id))

  useBackHandler(game.goToPlayers)

  let buttonText: string
  if (selectedCount === 0) buttonText = 'Wybierz kategorię'
  else if (isAllSelected) buttonText = 'Dalej • wszystkie kategorie'
  else if (selectedCount === 1) buttonText = 'Dalej • 1 kategoria'
  else if (selectedCount <= 4) buttonText = `Dalej • ${selectedCount} kategorie`
  else buttonText = `Dalej • ${selectedCount} kategorii`

  return (
    <AppBackground>
      <div className="screen with-bottom-bar">
        <div className="scroll-area pad-24">
          <Spacer h={16} />
          <div className="title-row">
            <BackArrow onClick={game.goToPlayers} />
            <h1 className="title-34">🗂️ Kategorie</h1>
          </div>
          <p className="body-15 text-secondary">Wybierz co najmniej jedną kategorię</p>
          <Spacer h={24} />

          {wordsStatus === 'loading' && <p className="body-15 text-muted center">Wczytywanie haseł…</p>}
          {wordsStatus === 'error' && (
            <div className="words-error">
              <p className="body-15 text-secondary center">Nie udało się wczytać bazy haseł.</p>
              <Spacer h={12} />
              <SecondaryButton onClick={game.retryWords}>Spróbuj ponownie</SecondaryButton>
            </div>
          )}

          {wordsStatus === 'ready' && (
            <>
              <button
                type="button"
                className={`category-card all ${isAllSelected ? 'selected' : ''}`}
                onClick={isAllSelected ? game.clearAllCategories : game.selectAllCategories}
              >
                <span className="category-text">
                  <span className="category-name">Wszystko</span>
                  <span className="category-description">Losuj hasła ze wszystkich kategorii.</span>
                </span>
                <span className="category-emoji">🎲</span>
              </button>
              <Spacer h={12} />
              {categories.map((category) => (
                <div key={category.id}>
                  <button
                    type="button"
                    className={`category-card ${selectedIds.has(category.id) ? 'selected' : ''}`}
                    onClick={() => game.toggleCategory(category.id)}
                  >
                    <span className="category-text">
                      <span className="category-name">{category.name}</span>
                      {category.description && <span className="category-description">{category.description}</span>}
                    </span>
                    <span className="category-emoji">{category.emoji}</span>
                  </button>
                  <Spacer h={12} />
                </div>
              ))}
            </>
          )}
        </div>
        <TopCornerActions side="end" theme={theme} onSelectTheme={onSelectTheme} onInfoClick={() => openRules()} />
        <BottomBar variant="translucent">
          <PrimaryButton disabled={selectedCount === 0} onClick={game.goToSettings}>
            {buttonText}
          </PrimaryButton>
        </BottomBar>
      </div>
    </AppBackground>
  )
}
