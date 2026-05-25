import { useEffect, useMemo, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import './index.css'
import { prepareRound, nextAvatar, winners } from './game/gameEngine'
import { DEFAULT_SETTINGS, DEFAULT_STATE, type Category, type GameState } from './game/types'
import { loadWords } from './game/wordPicker'
import { scoreImpostorGuess, scoreVotes } from './game/scoring'
import { storage } from './storage/localStorage'
import { themes, type ThemeKey } from './theme/themes'

function App() {
  const [theme, setTheme] = useState<ThemeKey>((storage.loadTheme() as ThemeKey) || 'classic')
  const [categories, setCategories] = useState<Category[]>([])
  const [wordsByCategory, setWordsByCategory] = useState<Record<string, any[]>>({})
  const [onboarding, setOnboarding] = useState(!storage.loadOnboardingSeen())
  const [state, setState] = useState<GameState>({ ...DEFAULT_STATE, players: storage.loadPlayers().map((p) => ({ id: crypto.randomUUID(), name: p.name, avatarEmoji: p.avatarEmoji, score: 0 })), settings: storage.loadSettings() ?? DEFAULT_SETTINGS })
  const [newName, setNewName] = useState('')
  const [voteSet, setVoteSet] = useState<Set<string>>(new Set())
  const [guessWord, setGuessWord] = useState('')
  const [timer, setTimer] = useState(0)

  useEffect(() => { loadWords().then(({ categories, wordsByCategory }) => { setCategories(categories); setWordsByCategory(wordsByCategory) }) }, [])
  useEffect(() => storage.saveTheme(theme), [theme])
  useEffect(() => storage.saveSettings(state.settings), [state.settings])
  useEffect(() => { if (state.phase === 'GAME_ROUND') setTimer(state.settings.roundDurationSeconds) }, [state.phase, state.settings.roundDurationSeconds])
  useEffect(() => { if (state.phase !== 'GAME_ROUND' || timer <= 0) return; const t = setTimeout(() => setTimer((v) => v - 1), 1000); return () => clearTimeout(t) }, [state.phase, timer])
  useEffect(() => { if (state.phase === 'GAME_ROUND' && timer === 0) setState((s) => ({ ...s, phase: 'VOTING' })) }, [timer, state.phase])

  const currentPlayer = state.players[state.currentRevealIndex]
  const winnersList = useMemo(() => winners(state), [state])
  const t = themes[theme]

  const addPlayer = () => {
    const name = newName.trim(); if (!name || state.players.length >= 12 || state.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return
    const avatarEmoji = nextAvatar(state.players.map((p) => p.avatarEmoji))
    const players = [...state.players, { id: crypto.randomUUID(), name, score: 0, avatarEmoji }]
    setState((s) => ({ ...s, players })); storage.savePlayers(players); setNewName('')
  }

  const panel = () => {
    if (onboarding) return <Card><h1>Witaj w Reproduktor</h1><p>Dodawaj graczy, wybierz kategorie, ustaw rundę i wykryj Reproduktorów.</p><Btn onClick={() => { storage.saveOnboardingSeen(); setOnboarding(false) }}>Zaczynajmy</Btn></Card>
    switch (state.phase) {
      case 'SETUP_PLAYERS': return <Card><h2>Gracze</h2><div className='row'><input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder='Imię gracza' /><Btn onClick={addPlayer}>Dodaj</Btn></div>{state.players.map((p) => <p key={p.id}>{p.avatarEmoji} {p.name}</p>)}<Btn onClick={() => setState((s) => ({ ...s, phase: 'SETUP_CATEGORIES' }))} disabled={state.players.length < 3}>Dalej</Btn></Card>
      case 'SETUP_CATEGORIES': return <Card><h2>Kategorie</h2>{categories.map((c) => <button key={c.id} className={`chip ${state.selectedCategoryIds.has(c.id) ? 'on' : ''}`} onClick={() => setState((s) => { const n = new Set(s.selectedCategoryIds); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return { ...s, selectedCategoryIds: n } })}>{c.emoji} {c.name}</button>)}<Btn onClick={() => setState((s) => ({ ...s, phase: 'SETUP_SETTINGS' }))} disabled={state.selectedCategoryIds.size === 0}>Dalej</Btn></Card>
      case 'SETUP_SETTINGS': return <Card><h2>Ustawienia</h2><Stepper label='Reproduktorzy' val={state.settings.impostorCount} on={(v: number) => setState((s) => ({ ...s, settings: { ...s.settings, impostorCount: Math.max(1, Math.min(s.players.length - 2, v)) } }))} /><Stepper label='Czas rundy (s)' val={state.settings.roundDurationSeconds} on={(v: number) => setState((s) => ({ ...s, settings: { ...s.settings, roundDurationSeconds: Math.max(30, v) } }))} /><Stepper label='Punkty do wygranej' val={state.settings.pointsToWin} on={(v: number) => setState((s) => ({ ...s, settings: { ...s.settings, pointsToWin: Math.max(3, v) } }))} /><Btn onClick={() => setState((s) => prepareRound(s, wordsByCategory))}>Start rundy</Btn></Card>
      case 'PASS_PHONE': return <Card><h2>Przekaż telefon</h2><p>{currentPlayer?.name}</p><Btn onClick={() => setState((s) => ({ ...s, phase: 'REVEAL_ROLE' }))}>Pokaż rolę</Btn></Card>
      case 'REVEAL_ROLE': return <Card><h2>Rola: {currentPlayer?.name}</h2><div className='veil'>{currentPlayer && state.currentImpostorIds.has(currentPlayer.id) ? <p>Jesteś Reproduktorem{state.settings.hintsEnabled ? ` • wskazówka: ${state.currentImpostorHints[currentPlayer.id] ?? '-'}` : ''}</p> : <p>Tajne słowo: {state.currentSecretWord?.word}</p>}</div><Btn onClick={() => setState((s) => s.currentRevealIndex + 1 >= s.players.length ? { ...s, currentRevealIndex: s.currentRevealIndex + 1, phase: 'READY_TO_START' } : { ...s, currentRevealIndex: s.currentRevealIndex + 1, phase: 'PASS_PHONE' })}>Dalej</Btn></Card>
      case 'READY_TO_START': return <Card><h2>Start rundy</h2><p>Zaczyna: {state.players[Math.floor(Math.random() * state.players.length)]?.name}</p><Btn onClick={() => setState((s) => ({ ...s, phase: 'GAME_ROUND' }))}>Uruchom timer</Btn></Card>
      case 'GAME_ROUND': return <Card><h2>Runda {state.roundNumber}</h2><p className='timer'>{timer}s</p><Btn onClick={() => setState((s) => ({ ...s, phase: 'IMPOSTOR_GUESS' }))}>Reproduktor zgaduje</Btn><Btn onClick={() => setState((s) => ({ ...s, phase: 'VOTING' }))}>Koniec rundy</Btn></Card>
      case 'IMPOSTOR_GUESS': return <Card><h2>Zgadywanie</h2><input value={guessWord} onChange={(e) => setGuessWord(e.target.value)} placeholder='Hasło' />{state.players.filter((p) => state.currentImpostorIds.has(p.id)).map((p) => <Btn key={p.id} onClick={() => { if (!state.currentSecretWord) return; const { players, result } = scoreImpostorGuess(state.players, state.currentImpostorIds, p.id, guessWord.trim().toLowerCase() === state.currentSecretWord.word.toLowerCase(), state.currentSecretWord); setState((s) => ({ ...s, players, lastRoundResult: result, phase: 'ROUND_RESULT' })) }}>Zatwierdź: {p.name}</Btn>)}<Btn onClick={() => setState((s) => ({ ...s, phase: 'GAME_ROUND' }))}>Wróć</Btn></Card>
      case 'VOTING': return <Card><h2>Głosowanie</h2>{state.players.map((p) => <button key={p.id} className={`chip ${voteSet.has(p.id) ? 'on' : ''}`} onClick={() => setVoteSet((v) => { const n = new Set(v); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n })}>{p.name}</button>)}<Btn onClick={() => { if (!state.currentSecretWord) return; const { players, result } = scoreVotes(state.players, state.currentImpostorIds, voteSet, state.currentSecretWord); setVoteSet(new Set()); setState((s) => ({ ...s, players, lastRoundResult: result, phase: 'ROUND_RESULT' })) }}>Zatwierdź głosy</Btn></Card>
      case 'ROUND_RESULT': return <Card><h2>Wynik rundy</h2><p>{state.lastRoundResult?.resultMessage}</p>{state.players.map((p) => <p key={p.id}>{p.name}: {p.score}</p>)}<Btn onClick={() => setState((s) => winnersList.length ? { ...s, phase: 'GAME_OVER' } : { ...prepareRound({ ...s, roundNumber: s.roundNumber + 1, lastRoundResult: null }, wordsByCategory) })}>Kolejna runda</Btn></Card>
      case 'GAME_OVER': return <Card><h2>Koniec gry</h2><p>Wygrali: {winnersList.map((w) => w.name).join(', ') || 'brak'}</p><Btn onClick={() => setState((s) => ({ ...DEFAULT_STATE, players: s.players.map((p) => ({ ...p, score: 0 })), settings: s.settings }))}>Zagraj ponownie</Btn></Card>
      default: return null
    }
  }

  return <main className={`app bg-gradient-to-b ${t.bg}`}><header><h1>Reproduktor</h1><select value={theme} onChange={(e) => setTheme(e.target.value as ThemeKey)}><option value='classic'>Classic</option><option value='pride'>Pride</option><option value='forest'>Forest</option></select></header>{panel()}</main>
}

const Card = ({ children }: { children: ReactNode }) => <section className='card'>{children}</section>
const Btn = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button className='btn' {...props}>{children}</button>
const Stepper = ({ label, val, on }: { label: string; val: number; on: (next: number) => void }) => <div className='step'><span>{label}</span><button onClick={() => on(val - 1)}>-</button><strong>{val}</strong><button onClick={() => on(val + 1)}>+</button></div>

export default App
