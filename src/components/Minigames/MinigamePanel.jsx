import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import Game1Runner from './Game1Runner'
import Game2Timing from './Game2Timing'
import Game3DragDrop from './Game3DragDrop'
import moneyBagSrc    from '../../assets/MoneyBag.png'
import foldedHandsSrc from '../../assets/FoldedHands.png'
import nerdFaceSrc    from '../../assets/NerdFace.png'
import partyPopperSrc from '../../assets/ PartyPopper.png'

const GAMES = [
  { num: 1, key: 'game1', iconSrc: moneyBagSrc,    title: 'Fund the Journey',        color: 'from-yellow-400 to-orange-500' },
  { num: 2, key: 'game2', iconSrc: foldedHandsSrc,  title: 'Seek the Blessing',       color: 'from-amber-400 to-yellow-300' },
  { num: 3, key: 'game3', iconSrc: nerdFaceSrc,     title: 'Break the Language Barrier', color: 'from-pink-400 to-purple-500' },
]

export default function MinigamePanel() {
  const { gameProgress } = useGame()
  const [currentGame, setCurrentGame] = useState(1)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionMsg, setTransitionMsg] = useState('')

  // 監聽通關 → 自動進下一關
  useEffect(() => {
    const key = `game${currentGame}`
    if (!gameProgress[key] || transitioning) return

    const next = currentGame + 1
    const current = GAMES[currentGame - 1]

    setTransitionMsg(`${current.title} cleared!`)
    setTransitioning(true)

    const t = setTimeout(() => {
      setTransitioning(false)
      if (next <= 3) setCurrentGame(next)
    }, 1800)

    return () => clearTimeout(t)
  }, [gameProgress.game1, gameProgress.game2, gameProgress.game3]) // eslint-disable-line

  const completedCount = Object.values(gameProgress).filter(Boolean).length

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1E2F5A 0%, #0E1628 60%, #080D1A 100%)' }}>

      {/* ── 遊戲主體（全螢幕） ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* 通關過渡動畫 */}
        {transitioning && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md animate-bounce-in px-6 text-center">
            <img src={partyPopperSrc} alt="🎉" className="w-16 h-16 mb-3" style={{ imageRendering: 'pixelated' }} />
            <p className="text-white text-xl font-black mb-1 leading-snug">{transitionMsg}</p>
            {currentGame < 3 && (
              <p className="text-purple-300 text-sm mt-2">
                Get ready for Mission {currentGame + 1}⋯
              </p>
            )}
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* 遊戲內容 */}
        <div className="h-full flex flex-col px-4 pt-3 pb-2 gap-2">
          {/* 遊戲標題列 */}
          <div className="flex items-center gap-3 flex-shrink-0 border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GAMES[currentGame - 1].color} flex items-center justify-center flex-shrink-0 shadow-lg p-1.5`}>
              <img src={GAMES[currentGame - 1].iconSrc} alt="" className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: 'rgba(116,185,255,0.5)' }}>Mission {currentGame} of 3</p>
              <h2 className="text-white font-black text-sm leading-tight truncate">
                {GAMES[currentGame - 1].title}
              </h2>
            </div>
            {gameProgress[`game${currentGame}`] && (
              <div className="flex-shrink-0 rounded-full px-2.5 py-1" style={{ background: 'rgba(76,209,55,0.12)', border: '1px solid #4CD137' }}>
                <span className="text-[10px] font-bold" style={{ color: '#4CD137' }}>✓ Clear</span>
              </div>
            )}
          </div>

          {/* 遊戲組件（flex-1 填滿剩餘高度） */}
          <div className="flex-1 min-h-0 flex flex-col">
            {currentGame === 1 && <Game1Runner />}
            {currentGame === 2 && <Game2Timing />}
            {currentGame === 3 && <Game3DragDrop />}
          </div>
        </div>
      </div>
    </div>
  )
}
