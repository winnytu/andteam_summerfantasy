import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import mainBg from '../assets/main.png'
import moneyBagSrc    from '../assets/MoneyBag.png'
import foldedHandsSrc from '../assets/FoldedHands.png'
import nerdFaceSrc    from '../assets/NerdFace.png'

export default function FinalScreen() {
  const [visible, setVisible] = useState(false)
  const [fired, setFired] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleWish = () => {
    if (fired) return
    setFired(true)
    launchFireworks()
  }

  return (
    <div
      className={`
        relative min-h-screen flex flex-col items-center justify-center
        transition-opacity duration-1000 overflow-hidden
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* 背景圖 */}
      <img
        src={mainBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover -z-10"
        style={{ imageRendering: 'pixelated', objectPosition: 'center center' }}
      />
      {/* 下方遮罩 */}
      <div className="absolute inset-0 -z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(10,24,58,0.70) 0%, rgba(10,24,58,0.15) 55%, transparent 100%)' }} />

      {/* 主內容 */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center w-full max-w-lg overflow-y-auto py-8">

        {/* 通關徽章 */}
        <div className="animate-bounce-in">
          <div className="inline-flex flex-col items-center gap-2 backdrop-blur-md rounded-3xl px-6 py-5" style={{ background: 'rgba(10,24,58,0.55)', border: '2px solid #FFD54F', boxShadow: '0 0 30px rgba(255,213,79,0.3)' }}>
            <div className="text-4xl" style={{ color: '#FFD54F' }}>🏆</div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#FFD54F' }}>
              All Missions Complete
            </div>
            <div className="text-2xl font-black mt-1 leading-snug" style={{ color: '#FFF9EE' }}>
              The Way to You
              <br />
              <span className="text-base font-semibold" style={{ color: '#FF8C42' }}>Clear!</span>
            </div>
          </div>
        </div>

        {/* 成就列表 */}
        <div
          className="flex flex-col gap-3 w-full animate-slide-up"
          style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {[
            { iconSrc: moneyBagSrc,    title: 'Fund the Journey',        desc: 'Funding goal reached' },
            { iconSrc: foldedHandsSrc, title: 'Seek the Blessing',       desc: 'Received 3× Holy Jiǎo' },
            { iconSrc: nerdFaceSrc,    title: 'Break the Language Barrier', desc: 'ずっと会いたかったです' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'rgba(10,24,58,0.55)', border: '1.5px solid rgba(255,213,79,0.3)' }}
            >
              <img src={item.iconSrc} alt="" className="w-7 h-7 flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
              <div className="text-left">
                <p className="font-semibold text-sm" style={{ color: '#FFF9EE' }}>{item.title}</p>
                <p className="text-xs" style={{ color: '#4CD137' }}>{item.desc}</p>
              </div>
              <span className="ml-auto font-bold text-sm" style={{ color: '#4CD137' }}>✓</span>
            </div>
          ))}
        </div>

        {/* 主按鈕 */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <button
            onClick={handleWish}
            className="group relative px-8 py-4 font-black text-base rounded-full transition-all duration-300 tracking-wide"
            style={fired
              ? { background: 'rgba(255,213,79,0.15)', color: '#FFD54F', border: '2px solid #FFD54F', boxShadow: '0 0 24px rgba(255,213,79,0.4)', cursor: 'default' }
              : { background: 'linear-gradient(to right, #FF8C42, #FFD54F)', color: '#4A3018', border: '3px solid #4A3018', boxShadow: '0 4px 0 #4A3018, 0 0 32px rgba(255,140,66,0.5)' }
            }
          >
            I Want to See &TEAM!
            {!fired && <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-rose-500 blur opacity-30 group-hover:opacity-60 transition-opacity -z-10" />}
          </button>
          {fired && (
            <p className="mt-3 text-xs" style={{ color: 'rgba(255,249,238,0.5)' }}>
              Made with ♥ for &TEAM · Summer Fantasy
            </p>
          )}
        </div>

      </div>
    </div>
  )
}


function launchFireworks() {
  const duration = 4000
  const end = Date.now() + duration

  const colors = ['#fde68a', '#f59e0b', '#ec4899', '#a855f7', '#22c55e', '#ffffff']

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors,
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  // 初始大爆發
  confetti({
    particleCount: 200,
    spread: 120,
    origin: { x: 0.5, y: 0.5 },
    colors,
    scalar: 1.2,
  })

  requestAnimationFrame(frame)
}
