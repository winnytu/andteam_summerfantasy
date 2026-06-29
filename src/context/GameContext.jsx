import { createContext, useContext, useState, useCallback } from 'react'

const GameContext = createContext(null)

export const PHASES = {
  START: 0,
  SCROLL_STORY: 1,
  MINIGAMES: 2,
  FINAL: 3,
}

export function GameProvider({ children }) {
  const [currentPhase, setCurrentPhase] = useState(PHASES.START)
  const [gameProgress, setGameProgress] = useState({
    game1: false,
    game2: false,
    game3: false,
  })
  const [hp, setHp] = useState(100)

  const completeGame = useCallback((gameKey) => {
    setGameProgress((prev) => {
      const next = { ...prev, [gameKey]: true }
      if (next.game1 && next.game2 && next.game3) {
        setTimeout(() => setCurrentPhase(PHASES.FINAL), 800)
      }
      return next
    })
  }, [])

  const allGamesComplete =
    gameProgress.game1 && gameProgress.game2 && gameProgress.game3

  return (
    <GameContext.Provider
      value={{
        currentPhase,
        setCurrentPhase,
        gameProgress,
        completeGame,
        allGamesComplete,
        hp,
        setHp,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
