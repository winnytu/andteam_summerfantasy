import { useGame, PHASES } from './context/GameContext'
import StartScreen from './components/StartScreen'
import ScrollStory from './components/ScrollStory/ScrollStory'
import MinigamePanel from './components/Minigames/MinigamePanel'
import FinalScreen from './components/FinalScreen'

export default function App() {
  const { currentPhase } = useGame()

  return (
    <div className="min-h-screen">
      {currentPhase === PHASES.START && <StartScreen />}
      {currentPhase === PHASES.SCROLL_STORY && <ScrollStory />}
      {currentPhase === PHASES.MINIGAMES && <MinigamePanel />}
      {currentPhase === PHASES.FINAL && <FinalScreen />}
    </div>
  )
}
