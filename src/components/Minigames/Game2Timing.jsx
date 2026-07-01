import { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import confetti from 'canvas-confetti'
import jiaoYinSrc from '../../assets/jiao-.png'
import jiaoYangSrc from '../../assets/jiqo+.png'

const NEEDED = 3

// true = 陽面, false = 陰面
function throwPiece() {
  return Math.random() < 0.5
}

function getResult(a, b) {
  if (a !== b)  return 'holy'   // 一陰一陽
  if (a && b)   return 'laugh'  // 兩陽
  return 'yin'                  // 兩陰
}

const RESULT_INFO = {
  holy:   { label: 'Holy Jiǎo', en: 'Blessing granted', icon: '✨', color: 'text-yellow-300', border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  laugh:  { label: 'Laughing Jiǎo', en: 'The gods are laughing', icon: '😆', color: 'text-orange-300', border: 'border-orange-400', bg: 'bg-orange-400/10' },
  yin:    { label: 'Silent Jiǎo', en: 'No answer', icon: '🌑', color: 'text-blue-300', border: 'border-blue-500', bg: 'bg-blue-500/10' },
}

export default function Game2Timing() {
  const { completeGame, gameProgress } = useGame()

  const [holy, setHoly] = useState(0)
  const [pieces, setPieces]       = useState([null, null])
  const [result, setResult]       = useState(null)
  const [throwing, setThrowing]   = useState(false)
  const [tries, setTries]         = useState(0)
  const [flash, setFlash]         = useState(false)

  const already = gameProgress.game2 || holy >= NEEDED

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === 'k' || e.key === 'K') && !already) {
        setHoly(NEEDED)
        completeGame('game2')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [already, completeGame])

  const handleThrow = useCallback(() => {
    if (throwing) return
    setThrowing(true)
    setResult(null)
    setPieces([null, null])

    let ticks = 0
    const interval = setInterval(() => {
      setPieces([throwPiece(), throwPiece()])
      ticks++
      if (ticks >= 10) {
        clearInterval(interval)
        const a = throwPiece()
        const b = throwPiece()
        const r = getResult(a, b)
        setPieces([a, b])
        setResult(r)
        setTries(t => t + 1)
        setThrowing(false)
        setFlash(true)
        setTimeout(() => setFlash(false), 600)

        if (r === 'holy') {
          const next = holy + 1
          setHoly(next)
          confetti({ particleCount: 70, spread: 55, origin: { y: 0.55 },
            colors: ['#fde68a', '#f59e0b', '#ffffff', '#a855f7'] })
          if (next >= NEEDED) {
            confetti({ particleCount: 220, spread: 110, origin: { y: 0.5 },
              colors: ['#fde68a', '#f59e0b', '#ffffff', '#a855f7', '#ec4899'] })
            setTimeout(() => completeGame('game2'), 900)
          }
        }
      }
    }, 60)
  }, [throwing, holy, completeGame])

  return (
    <div className="flex flex-col items-center justify-center gap-5 w-full h-full max-w-sm mx-auto overflow-y-auto py-2">

      {/* 標題 + 簡短敘事 */}
      <div className="text-center px-2">
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,220,160,0.65)' }}>
          Too many unknowns on this road. I need the gods on my side.
        </p>
        <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,249,238,0.40)' }}>
          Get <span style={{ color: '#FFD54F' }}>Holy Jiǎo</span> (one yin · one yang) × <span style={{ color: '#FFD54F' }}>{NEEDED}</span>
        </p>
      </div>

      {already ? (
        <div className="text-center flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {Array.from({ length: NEEDED }).map((_, i) => (
              <JiaoPiece key={i} yang spinning={false} lit />
            ))}
          </div>
          <p className="font-black text-lg" style={{ color: '#FFD54F' }}>Three holy throws. Blessing granted! 🙏</p>
        </div>
      ) : (
        <>
          {/* 已收集聖筊 */}
          <div className="flex gap-3 items-end">
            {Array.from({ length: NEEDED }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`transition-all duration-500 ${i < holy ? 'scale-110' : 'scale-90 opacity-25'}`}>
                  <JiaoPair lit={i < holy} />
                </div>
                <span className={`text-[9px] font-bold tracking-widest transition-colors ${i < holy ? 'text-yellow-400' : 'text-gray-700'}`}>
                  {i < holy ? 'Holy' : '· · ·'}
                </span>
              </div>
            ))}
          </div>

          {/* 擲筊區 */}
          <div className={`flex gap-8 items-center justify-center px-8 py-5 rounded-3xl border-2 transition-all duration-200 ${
            result ? RESULT_INFO[result].border + ' ' + RESULT_INFO[result].bg : 'border-white/8'
          } ${flash ? 'scale-105' : 'scale-100'}`}
            style={!result ? { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' } : {}}
          >
            <JiaoPiece yang={pieces[0] === null ? null : pieces[0]} spinning={throwing} flip={pieces[0] !== true} />
            <JiaoPiece yang={pieces[1] === null ? null : pieces[1]} spinning={throwing} flip={pieces[1] === true} />
          </div>

          {/* 結果顯示 */}
          <div className="h-10 flex items-center justify-center">
            {result ? (
              <div className={`flex flex-col items-center gap-2 font-black text-base ${RESULT_INFO[result].color}`}>
                <p>{RESULT_INFO[result].label}</p>
                <p className="text-xs font-semibold opacity-60">{RESULT_INFO[result].en}</p>
              </div>
            ) : (
              <div className="flex gap-4 text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
                <span><span className="font-bold" style={{ color: 'rgba(253,224,71,0.7)' }}>Holy<br/></span> yin+yang</span>
                <span><span className="font-bold" style={{ color: 'rgba(251,146,60,0.7)' }}>Laugh<br/></span> both yang</span>
                <span><span className="font-bold" style={{ color: 'rgba(147,197,253,0.7)' }}>Silent<br/></span> both yin</span>
              </div>
            )}
          </div>

          {/* 擲筊按鈕 */}
          <button
            onClick={handleThrow}
            disabled={throwing || holy >= NEEDED}
            className="px-12 py-3.5 rounded-full font-black text-lg tracking-widest select-none transition-all duration-200 hover:scale-105 active:scale-95"
            style={!throwing && holy < NEEDED
              ? { background: 'linear-gradient(to right, #FF8C42, #FFD54F)', color: '#4A3018', border: '2px solid #4A3018', boxShadow: '0 4px 0 #4A3018, 0 0 24px rgba(255,213,79,0.5)', cursor: 'pointer' }
              : { background: 'rgba(30,39,73,0.6)', color: '#4a5568', border: '2px solid rgba(74,48,24,0.2)', cursor: 'not-allowed' }}
          >
            {throwing ? 'Throwing…' : 'Throw'}
          </button>

          {tries > 0 && (
            <p className="text-[10px]" style={{ color: 'rgba(156,163,175,0.4)' }}>#{tries} throws · {holy}/{NEEDED} Holy</p>
          )}
        </>
      )}
    </div>
  )
}

// yang: true=陽面 / false=陰面 / null=擲出前. flip 水平鏡像讓兩塊朝內
function JiaoPiece({ yang, spinning, lit, flip = false }) {
  const isUnknown = yang === null
  const src = yang ? jiaoYangSrc : jiaoYinSrc

  return (
    <div
      className={`relative flex-shrink-0 ${spinning ? 'animate-bounce' : ''}`}
      style={{ width: 52, height: 80 }}
    >
      <img
        src={isUnknown ? jiaoYinSrc : src}
        alt={isUnknown ? '?' : yang ? 'Yang' : 'Yin'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          transform: flip ? 'scaleX(-1)' : 'none',
          filter: isUnknown
            ? 'grayscale(1) brightness(0.5)'
            : lit
            ? 'drop-shadow(0 0 8px rgba(251,191,36,0.9)) drop-shadow(0 0 16px rgba(251,191,36,0.5))'
            : 'none',
          opacity: isUnknown ? 0.5 : 1,
          transition: 'filter 0.3s, opacity 0.3s',
        }}
      />
    </div>
  )
}

// ── Pair of jiǎo for progress slots ───────────────────
function JiaoPair({ lit }) {
  return (
    <div className="flex gap-1">
      <JiaoPiece yang={false} spinning={false} lit={lit} flip={true} />
      <JiaoPiece yang={true}  spinning={false} lit={lit} flip={true} />
    </div>
  )
}
