import { useEffect, useRef, useState } from 'react'
import { useGame, PHASES } from '../../context/GameContext'
import HPBar from './HPBar'
import CatchGame from './CatchGame'
import section1Bg from '../../assets/section1_bg.png'
import section2Bg from '../../assets/section2_bg.png'
import meIdleSrc from '../../assets/me_idle2.png'

export default function ScrollStory() {
  const { setHp, setCurrentPhase } = useGame()
  const containerRef = useRef(null)
  const progressRef = useRef(0)

  // phase: 'section1' | 'transition' | 'catchgame'
  const [phase, setPhase] = useState('section1')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [transitionVisible, setTransitionVisible] = useState(false)
  const [showSkipBtn, setShowSkipBtn] = useState(false)

  // 逐行出現閾值
  const P0 = 0.03   // 章節標題
  const P1 = 0.18   // 行一
  const P2 = 0.32   // 行二
  const P3 = 0.46   // 行三
  const P4 = 0.60   // 行四

  // ─── Section 1 捲動偵測 ──────────────────────────────
  useEffect(() => {
    if (phase !== 'section1') return
    const el = containerRef.current
    if (!el) return

    // 確保內容高度足夠（無需額外 state，滾動偵測即可）
    const checkReady = () => {
      if (el.scrollHeight <= el.clientHeight) return
    }
    checkReady()

    const handleScroll = () => {
      const scrollTop = el.scrollTop
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return

      const progress = scrollTop / maxScroll
      progressRef.current = progress

      const newHp = Math.max(20, Math.round(100 - progress * 80))
      setHp(newHp)
      setScrollProgress(progress)

      // 顯示跳過按鈕（捲了 30% 就可以跳）
      if (progress > 0.3) setShowSkipBtn(true)

      // 捲到 85% 即觸發（更寬鬆）
      if (progress >= 0.85) {
        enterTransition()
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [phase]) // eslint-disable-line

  const enterTransition = () => {
    setPhase('transition')
  }

  // ─── 過渡動畫（只做淡入，不自動跳轉）─────────────────────
  useEffect(() => {
    if (phase !== 'transition') return
    const t = setTimeout(() => setTransitionVisible(true), 80)
    return () => clearTimeout(t)
  }, [phase])

  const handleCatchComplete = () => {
    setCurrentPhase(PHASES.MINIGAMES)
  }

  // ─── CatchGame 畫面 ───────────────────────────────────
  if (phase === 'catchgame') {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ background: 'linear-gradient(to bottom, #74B9FF, #FFF9EE, #FF8C42)' }}>
        <HPBar />
        <CatchGame onComplete={handleCatchComplete} />
      </div>
    )
  }

  // ─── 過渡動畫 ─────────────────────────────────────────
  if (phase === 'transition') {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-6 transition-all duration-700 relative overflow-hidden ${
          transitionVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${section2Bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <HPBar />
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center max-w-sm">
          <div className="text-5xl animate-bounce">☀️</div>
          <div>
            <p className="text-white text-xl font-black tracking-wide mb-3">Then I found &TEAM.</p>
            <p className="text-white/80 text-sm leading-relaxed">
              Their songs, their stages, the way they laugh on camera.
              Suddenly there was something I actually wanted to wake up for,
              and the heavy days started to feel a little lighter.
            </p>
          </div>
          <button
            onClick={() => setPhase('catchgame')}
            className="mt-2 px-8 py-3 rounded-full font-black text-base tracking-wide hover:scale-105 active:scale-95 transition-transform"
            style={{
              background: 'linear-gradient(to right, #FF8C42, #FFD54F)',
              color: '#4A3018',
              border: '2px solid #4A3018',
              boxShadow: '0 4px 0 #4A3018, 0 0 20px rgba(255,213,79,0.4)',
            }}
          >
            Get the Energy
          </button>
        </div>
      </div>
    )
  }

  // ─── Section 1：捲動畫面 ──────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-y-scroll"
      style={{ scrollbarWidth: 'thin' }}
    >
      <HPBar />

      {/* 人物在大樓前街道 */}
      <div className="fixed bottom-4 left-6 z-40">
        <PlayerIdle />
      </div>

      {/* 背景圖：錨定底部，讓大樓貼地 */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${section1Bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 靜態半透明遮罩，讓文字可讀 */}
      <div className="fixed inset-0 -z-10 bg-black/30" />

      {/* ── 捲動段落區（文字浮在天空上半部）── */}
      <section
        className="flex flex-col items-center justify-center px-6 relative"
        style={{ minHeight: '340vh' }}
      >
        <div className="sticky w-full max-w-xl pointer-events-none" style={{ top: '18%' }}>
          <div className="flex flex-col gap-4 px-4">

            {/* 章節標題 */}
            <FadeBlock show={scrollProgress >= P0}>
              <div className="text-center">
                <span
                  className="inline-block text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-2"
                  style={{ background: 'rgba(116,185,255,0.18)', border: '1px solid rgba(116,185,255,0.35)', color: '#74B9FF' }}
                >
                  Chapter 01 / The Empty Days
                </span>
                <h2 className="text-2xl font-black text-white leading-snug" style={{ textShadow: '0 2px 12px rgba(8,14,35,0.8)' }}>
                  Same days, on repeat.
                </h2>
              </div>
            </FadeBlock>

            {/* 逐行淡入 */}
            <FadeBlock show={scrollProgress >= P1}>
              <p className="text-sm leading-relaxed text-center px-2" style={{ color: 'rgba(210,225,255,0.90)' }}>
                Most days kind of blur into each other.
              </p>
            </FadeBlock>

            <FadeBlock show={scrollProgress >= P2} delay="60ms">
              <p className="text-sm leading-relaxed text-center px-2" style={{ color: 'rgba(210,225,255,0.78)' }}>
                Wake up, work, sleep, repeat. I was just getting through them.
              </p>
            </FadeBlock>

            <FadeBlock show={scrollProgress >= P3} delay="60ms">
              <p className="text-sm leading-relaxed text-center px-2" style={{ color: 'rgba(210,225,255,0.65)' }}>
                I couldn't remember the last time I looked forward to anything.
              </p>
            </FadeBlock>

            <FadeBlock show={scrollProgress >= P4} delay="60ms">
              <p className="text-sm leading-relaxed text-center px-2" style={{ color: 'rgba(210,225,255,0.52)' }}>
                And I'd gotten so used to it
                <br />
                that I barely noticed anymore.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs mt-5" style={{ color: 'rgba(116,185,255,0.45)' }}>
                <span className="animate-bounce inline-block">↓</span>
                <span>Keep scrolling</span>
                <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>↓</span>
              </div>
            </FadeBlock>

          </div>
        </div>
      </section>
    </div>
  )
}

function FadeBlock({ show, delay = '0ms', children }) {
  return (
    <div
      style={{
        transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(28px)',
      }}
    >
      {children}
    </div>
  )
}

const IDLE_FRAMES = 4
const IDLE_FRAME_MS = 140
const SPRITE_H = 96  // display height; width is computed from sprite aspect ratio

function PlayerIdle() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const lastRef = useRef(0)
  const imgRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const img = new Image()
    img.src = meIdleSrc
    imgRef.current = img

    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw)
      if (now - lastRef.current > IDLE_FRAME_MS) {
        lastRef.current = now
        frameRef.current = (frameRef.current + 1) % IDLE_FRAMES
      }
      const canvas = canvasRef.current
      if (!canvas || !img.complete) return
      const srcW = img.naturalWidth / IDLE_FRAMES
      const srcH = img.naturalHeight
      const destW = Math.round(SPRITE_H * (srcW / srcH))
      if (canvas.width !== destW)  canvas.width  = destW
      if (canvas.height !== SPRITE_H) canvas.height = SPRITE_H
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, destW, SPRITE_H)
      ctx.drawImage(img, frameRef.current * srcW, 0, srcW, srcH, 0, 0, destW, SPRITE_H)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={40}
      height={SPRITE_H}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
