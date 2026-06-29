import { useEffect, useRef, useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { useInputHint } from '../../hooks/useDeviceInput'
import aoarashiUrl from '../../assets/aoarashi.mp3'
import meIdleSrc from '../../assets/me_idle2.png'
import section2Bg from '../../assets/section2_bg.png'

import imgK        from '../../assets/member/k.png'
import imgFuma     from '../../assets/member/fuma.png'
import imgJo       from '../../assets/member/jo.png'
import imgHarua    from '../../assets/member/harua.png'
import imgTaki     from '../../assets/member/taki.png'
import imgMaki     from '../../assets/member/maki.png'
import imgEJ       from '../../assets/member/ej.png'
import imgYuma     from '../../assets/member/yuma.png'
import imgNicholas from '../../assets/member/nicholas.png'

const IDLE_FRAMES = 4

const PLAYER_W = 64
const PLAYER_SPEED = 7
const ICON_SIZE = 60
const SPAWN_INTERVAL = 900

const MEMBERS = [
  { name: 'K',        img: imgK,        color: '#94a3b8', border: '#cbd5e1', glow: 'rgba(148,163,184,0.9)', emoji: '🩶' },
  { name: 'Fuma',     img: imgFuma,     color: '#fb923c', border: '#fdba74', glow: 'rgba(251,146,60,0.9)',  emoji: '🧡' },
  { name: 'Nicholas', img: imgNicholas, color: '#818cf8', border: '#a5b4fc', glow: 'rgba(129,140,248,0.9)', emoji: '💜' },
  { name: 'EJ', img: imgEJ, color: '#facc15', border: '#fde68a', glow: 'rgba(250,204,21,0.9)', emoji: '💛' },
  { name: 'Jo',       img: imgJo,       color: '#4ade80', border: '#86efac', glow: 'rgba(74,222,128,0.9)',  emoji: '💚' },
  { name: 'Yuma', img: imgYuma, color: '#2dd4bf', border: '#99f6e4', glow: 'rgba(45,212,191,0.9)', emoji: '🩵' },
  { name: 'Harua',    img: imgHarua,    color: '#38bdf8', border: '#7dd3fc', glow: 'rgba(56,189,248,0.9)',  emoji: '💙' },
  { name: 'Taki',     img: imgTaki,     color: '#a78bfa', border: '#c4b5fd', glow: 'rgba(167,139,250,0.9)', emoji: '💜' },
  { name: 'Maki',     img: imgMaki,     color: '#f472b6', border: '#fda4af', glow: 'rgba(244,114,182,0.9)', emoji: '🩷' },
]

const TOTAL_MEMBERS = MEMBERS.length
const HP_START = 20

export default function CatchGame({ onComplete }) {
  const { hp, setHp } = useGame()
  const moveHint = useInputHint('catchMove')
  const containerRef = useRef(null)

  const playerXRef = useRef(0)
  const keysRef = useRef({ left: false, right: false })
  const touchSideRef = useRef(null)
  const containerWRef = useRef(700)
  const containerHRef = useRef(440)

  const iconsRef = useRef([])
  const idRef = useRef(0)
  const lastSpawnRef = useRef(0)

  const hpRef = useRef(hp)
  const completedRef = useRef(false)
  const collectedSetRef = useRef(new Set())
  const rafRef = useRef(null)

  const [playerX, setPlayerX] = useState(0)
  const [icons, setIcons] = useState([])
  const [flash, setFlash] = useState(null)
  const [collected, setCollected] = useState(new Set())
  const [subtitle, setSubtitle] = useState('Just seeing you all brings me right back to life.')
  const [showCTA, setShowCTA] = useState(false)

  // ── 音樂 ──
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  // 自動播放
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const t = setTimeout(async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        setNeedsTap(true)
      }
    }, 300)
    return () => { clearTimeout(t); audio.pause() }
  }, [])

  const handleTapToStart = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    setNeedsTap(false)
    await audio.play()
    setIsPlaying(true)
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(m => !m)
  }, [])

  // ── 初始化容器尺寸 + ResizeObserver ──
  useEffect(() => {
    if (!containerRef.current) return
    const update = () => {
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      containerWRef.current = w
      containerHRef.current = h
      playerXRef.current = w / 2 - PLAYER_W / 2
      setPlayerX(playerXRef.current)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // ── 鍵盤控制 ──
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') { e.preventDefault(); keysRef.current.left = true }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); keysRef.current.right = true }
    }
    const up = (e) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keysRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // 觸控：滑動 + 按住左/右半屏
  const touchXRef = useRef(null)
  const handleTouchStart = useCallback((e) => {
    if (showCTA || needsTap) return
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    const x = e.touches[0].clientX - (rect?.left ?? 0)
    touchXRef.current = x
    touchSideRef.current = x < containerWRef.current / 2 ? 'left' : 'right'
  }, [showCTA, needsTap])

  const handleTouchMove = useCallback((e) => {
    if (touchXRef.current == null) return
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    const x = e.touches[0].clientX - (rect?.left ?? 0)
    const dx = x - touchXRef.current
    playerXRef.current = Math.max(0, Math.min(containerWRef.current - PLAYER_W, playerXRef.current + dx * 0.9))
    setPlayerX(playerXRef.current)
    touchXRef.current = x
    touchSideRef.current = x < containerWRef.current / 2 ? 'left' : 'right'
  }, [])

  const handleTouchEnd = useCallback(() => {
    touchXRef.current = null
    touchSideRef.current = null
  }, [])

  // ── 生成圖示 ──
  const spawnIcon = useCallback((count = 1) => {
    const w = containerWRef.current
    for (let i = 0; i < count; i++) {
      const member = MEMBERS[Math.floor(Math.random() * MEMBERS.length)]
      iconsRef.current.push({
        id: idRef.current++,
        member,
        x: Math.max(0, Math.random() * (w - ICON_SIZE)),
        y: -ICON_SIZE - i * 28,
        speed: 2.8 + Math.random() * 2.2,
      })
    }
  }, [])

  // ── 主遊戲迴圈 ──
  useEffect(() => {
    if (completedRef.current) return

    const loop = (now) => {
      if (completedRef.current) return
      const w = containerWRef.current
      const h = containerHRef.current
      const groundY = h - 88

      // 玩家移動
      if (keysRef.current.left || touchSideRef.current === 'left') {
        playerXRef.current = Math.max(0, playerXRef.current - PLAYER_SPEED)
        setPlayerX(playerXRef.current)
      }
      if (keysRef.current.right || touchSideRef.current === 'right') {
        playerXRef.current = Math.min(w - PLAYER_W, playerXRef.current + PLAYER_SPEED)
        setPlayerX(playerXRef.current)
      }

      // 隨機生成（40% 機率一次掉 2 個）
      if (now - lastSpawnRef.current > SPAWN_INTERVAL) {
        lastSpawnRef.current = now
        spawnIcon(Math.random() < 0.4 ? 2 : 1)
      }

      // 更新圖示 + 碰撞
      let caught = null
      iconsRef.current = iconsRef.current
        .map((ic) => ({ ...ic, y: ic.y + ic.speed }))
        .filter((ic) => {
          if (ic.y > h + 20) return false
          const px = playerXRef.current
          const py = groundY - 4
          if (
            !caught &&
            ic.x < px + PLAYER_W + 8 &&
            ic.x + ICON_SIZE > px - 8 &&
            ic.y + ICON_SIZE > py &&
            ic.y < py + 52
          ) {
            caught = ic
            return false
          }
          return true
        })

      if (caught && !completedRef.current) {
        const name = caught.member.name
        const isNew = !collectedSetRef.current.has(name)
        collectedSetRef.current.add(name)
        setCollected(new Set(collectedSetRef.current))

        // 起始 20%，每收到新成員平分剩下的 80%
        if (isNew) {
          const newHp = Math.min(100, HP_START + Math.round((collectedSetRef.current.size / TOTAL_MEMBERS) * (100 - HP_START)))
          hpRef.current = newHp
          setHp(newHp)
        }

        setFlash({ name, x: caught.x + ICON_SIZE / 2, y: groundY - 110, color: caught.member.color, emoji: caught.member.emoji, isNew })
        setTimeout(() => setFlash(null), 700)

        if (collectedSetRef.current.size >= TOTAL_MEMBERS) {
          completedRef.current = true
          setTimeout(() => {
            setSubtitle('Got all nine of you!')
            setTimeout(() => setShowCTA(true), 1200)
          }, 400)
        }
      }

      setIcons([...iconsRef.current])
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spawnIcon, setHp])

  const groundY = containerHRef.current - 88

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{
        backgroundImage: `url(${section2Bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* ── 頂部資訊區（由上往下疊，pt 留出 HP 條空間）── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-16 gap-1 pointer-events-none">
        {/* 字幕 */}
        <div className="bg-black/35 backdrop-blur-sm rounded-full px-4 py-1.5 text-white font-semibold text-xs max-w-[280px] text-center leading-relaxed">
          {subtitle}
        </div>

        {/* Chapter badge */}
        <div className="inline-flex items-center gap-1.5 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase" style={{ background: 'rgba(74,48,24,0.35)', color: 'rgba(255,249,238,0.7)', border: '1px solid rgba(74,48,24,0.4)' }}>
          Chapter 02 · Summer Recharge
          <span style={{ color: 'rgba(255,249,238,0.35)' }}>· {moveHint}</span>
        </div>

        {/* 成員收集排 */}
        <div className="flex flex-col items-center gap-0.5 mt-2">
          <div className="text-[8px] font-bold" style={{ color: 'rgba(255,249,238,0.5)' }}>
            Catch all members · {collected.size}/{TOTAL_MEMBERS}
          </div>
          <div className="flex gap-2 justify-center mt-2">
            {MEMBERS.map((m) => {
              const done = collected.has(m.name)
              return (
                <div
                  key={m.name}
                  className="rounded-md overflow-hidden flex-shrink-0 transition-all duration-300"
                  style={{
                    width: 26, height: 26,
                    boxShadow: done ? `0 0 5px ${m.glow}` : 'none',
                    filter: done ? 'none' : 'grayscale(1) brightness(0.3)',
                    outline: done ? `2px solid ${m.border}` : '1px solid rgba(255,255,255,0.08)',
                    outlineOffset: done ? '1px' : '0px',
                  }}
                >
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 音樂列 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-72">
        <MusicBar isPlaying={isPlaying} isMuted={isMuted} onToggleMute={toggleMute} audioRef={audioRef} />
      </div>

        {/* 掉落圖示 */}
        {icons.map((ic) => <FallingIcon key={ic.id} icon={ic} />)}

        {/* 接到特效 */}
        {flash && (
          <div
            className="absolute z-30 pointer-events-none font-black animate-bounce-in"
            style={{
              left: flash.x,
              top: flash.y,
              transform: 'translateX(-50%)',
              color: flash.isNew ? '#FFD54F' : flash.color,
              fontSize: flash.isNew ? '1.1rem' : '0.9rem',
              textShadow: flash.isNew
                ? `0 0 16px #FFD54F, 0 0 32px rgba(255,213,79,0.5)`
                : `0 0 10px ${flash.color}`,
            }}
          >
            {flash.isNew ? `${flash.emoji} +HP!` : flash.emoji}
          </div>
        )}


        {/* 玩家 */}
        <PlayerSprite x={playerX} groundY={groundY} />

        {/* autoplay 被擋時的點擊遮罩 */}
        {needsTap && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer"
            onClick={handleTapToStart}
          >
            <div className="text-5xl mb-3 animate-bounce">🎵</div>
            <p className="text-white font-black text-lg">Tap to Play</p>
            <p className="text-white/60 text-xs mt-1">Aoarashi / &TEAM</p>
          </div>
        )}


        {/* 操作提示 */}
        <div className="absolute bottom-24 right-3 text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{moveHint}</div>

        {/* 通關遮罩 */}
        {showCTA && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-6 bg-black/40 backdrop-blur-sm animate-slide-up">
            <div className="rounded-3xl px-7 py-6 max-w-sm text-center" style={{ background: 'rgba(21,27,52,0.75)', border: '2px solid rgba(255,213,79,0.5)', boxShadow: '0 0 32px rgba(255,213,79,0.2)' }}>
              <p className="text-base font-black mb-3" style={{ color: '#FFD54F' }}>Got all nine of you!</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,249,238,0.75)' }}>
              You lit up my days. Now I want to cross the screen, just to deliver my feelings to you in person. <br/>
              </p>
              <div className="my-3 border-t border-white/10" />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,213,79,0.9)' }}>
                But before I can actually meet you, there are
                <span className="font-black"> three things </span>
                I need to pull off first.
              </p>
            </div>
            <button
              onClick={onComplete}
              className="px-10 py-4 font-black text-lg rounded-full hover:scale-105 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(to right, #FF8C42, #FFD54F)', color: '#4A3018', border: '2px solid #4A3018', boxShadow: '0 4px 0 #4A3018, 0 0 24px rgba(255,213,79,0.6)' }}
            >
              Accept the Mission
            </button>
          </div>
        )}
    </div>
  )
}

// ── 音樂列 ────────────────────────────────────────────────
function MusicBar({ isPlaying, isMuted, onToggleMute, audioRef }) {
  return (
    <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
      <audio ref={audioRef} src={aoarashiUrl} loop preload="auto" />
      <div className="text-2xl select-none">{isMuted ? '🔇' : isPlaying ? '🎵' : '🎶'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">Aoarashi / &TEAM</p>
        <p className="text-gray-400 text-[10px]">
          {isMuted ? 'Muted' : isPlaying ? 'Playing ♪' : 'Loading⋯'}
        </p>
      </div>
      <button
        onClick={onToggleMute}
        className="w-10 h-10 rounded-full flex items-center justify-center text-base bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 border border-white/20"
      >
        {isMuted ? '🔊' : '🔇'}
      </button>
    </div>
  )
}

// ── 掉落圖示 ──────────────────────────────────────────────
function FallingIcon({ icon }) {
  return (
    <div
      className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
      style={{ left: icon.x, top: icon.y, width: ICON_SIZE }}
    >
      <img
        src={icon.member.img}
        alt={icon.member.name}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          imageRendering: 'pixelated',
          filter: `drop-shadow(0 0 6px ${icon.member.glow}) drop-shadow(0 3px 6px rgba(0,0,0,0.35))`,
        }}
      />
      <span className="text-[9px] font-bold bg-black/50 rounded-full px-1.5 py-px text-white">
        {icon.member.name}
      </span>
    </div>
  )
}

// ── 玩家 ──────────────────────────────────────────────────
function PlayerSprite({ x, groundY }) {
  const canvasRef = useRef(null)
  const destWRef = useRef(45)
  const H = 110

  useEffect(() => {
    const img = new Image()
    img.src = meIdleSrc
    let timerId = null

    img.onload = () => {
      const frameW = img.naturalWidth / IDLE_FRAMES
      const frameH = img.naturalHeight
      const destW = Math.round(H * (frameW / frameH))
      destWRef.current = destW
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = destW
      canvas.height = H

      let f = 0
      const draw = () => {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, destW, H)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, f * frameW, 0, frameW, frameH, 0, 0, destW, H)
        f = (f + 1) % IDLE_FRAMES
      }
      draw()
      timerId = setInterval(draw, 140)
    }

    return () => clearInterval(timerId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        top: groundY - H,
        left: x + PLAYER_W / 2 - destWRef.current / 2,
        imageRendering: 'pixelated',
      }}
    />
  )
}
