import { useEffect, useRef, useState, useCallback } from 'react'
import { useGame } from '../../context/GameContext'
import { useInputHint } from '../../hooks/useDeviceInput'
import runBgSrc from '../../assets/run_bg.png'
import coinSrc from '../../assets/coin.png'
import billSrc from '../../assets/bill.png'
import meRunSrc from '../../assets/me_run2.png'

const SPRITE_FRAMES = 4

const PLAYER_W = 36
const PLAYER_H = 44
const GRAVITY = 0.55
const JUMP_FORCE = -13
const SPEED = 5
const SPAWN_INTERVAL = 1500

export default function Game1Runner() {
  const { completeGame } = useGame()
  const jumpHint = useInputHint('runnerJump')
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)

  // 動態 canvas 尺寸（ref，不會觸發 re-render）
  const cwRef = useRef(700)
  const chRef = useRef(320)

  const stateRef = useRef(null)
  const rafRef = useRef(null)
  const completedRef = useRef(false)
  const bgImgRef = useRef(null)
  const coinImgRef = useRef(null)
  const billImgRef = useRef(null)
  const spriteImgRef = useRef(null)

  const [fund, setFund] = useState(0)
  const [gameStatus, setGameStatus] = useState('idle')
  const [shake, setShake] = useState(false)

  // 初始化 state（使用動態尺寸）
  const makeInitState = useCallback(() => {
    const ch = chRef.current
    const groundY = ch - 50
    return {
      running: false,
      player: { x: 80, y: groundY - PLAYER_H, vy: 0, onGround: true },
      obstacles: [],
      coins: [],
      fund: 0,
      lastSpawn: 0,
      shaking: false,
      frame: 0,
      frameTimer: 0,
      bgOffset: 0,
    }
  }, [])

  useEffect(() => {
    const bg = new Image(); bg.src = runBgSrc; bg.onload = () => { bgImgRef.current = bg }
    const coin = new Image(); coin.src = coinSrc; coin.onload = () => { coinImgRef.current = coin }
    const bill = new Image(); bill.src = billSrc; bill.onload = () => { billImgRef.current = bill }
    const sprite = new Image(); sprite.src = meRunSrc; sprite.onload = () => { spriteImgRef.current = sprite }
  }, [])

  // ── ResizeObserver：canvas 跟容器同寬高 ──
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      cwRef.current = w
      chRef.current = h
      canvas.width = w
      canvas.height = h
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  const jump = useCallback(() => {
    const s = stateRef.current
    if (s?.player.onGround && s?.running) {
      s.player.vy = JUMP_FORCE
      s.player.onGround = false
    }
  }, [])

  const startGame = useCallback(() => {
    stateRef.current = makeInitState()
    const s = stateRef.current
    s.running = true
    s.lastSpawn = performance.now()
    completedRef.current = false
    setFund(0)
    setGameStatus('running')
  }, [makeInitState])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameStatus === 'running') jump()
      }
      if (e.key === 'k' || e.key === 'K') {
        if (completedRef.current) return
        completedRef.current = true
        if (stateRef.current) stateRef.current.running = false
        setFund(100)
        setGameStatus('won')
        completeGame('game1')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [jump, gameStatus, completeGame])

  useEffect(() => {
    if (gameStatus !== 'running') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = (now) => {
      const s = stateRef.current
      if (!s?.running) return

      const cw = cwRef.current
      const ch = chRef.current
      const groundY = ch - 50

      s.frameTimer++
      if (s.frameTimer % 6 === 0) s.frame = (s.frame + 1) % SPRITE_FRAMES

      // 物理
      s.player.vy += GRAVITY
      s.player.y += s.player.vy
      if (s.player.y >= groundY - PLAYER_H) {
        s.player.y = groundY - PLAYER_H
        s.player.vy = 0
        s.player.onGround = true
      }

      // 生成
      if (now - s.lastSpawn > SPAWN_INTERVAL) {
        s.lastSpawn = now
        if (Math.random() < 0.30) {
          s.obstacles.push({ x: cw + 20, y: groundY - 38, w: 34, h: 38 })
        } else {
          const coinY = groundY - PLAYER_H - 30 - Math.random() * 40
          s.coins.push({ x: cw + 20, y: coinY, r: 14, alive: true })
          // 40% 機率再多生一枚，稍微錯開位置
          if (Math.random() < 0.4) {
            const coinY2 = groundY - PLAYER_H - 30 - Math.random() * 40
            s.coins.push({ x: cw + 70, y: coinY2, r: 14, alive: true })
          }
        }
      }

      // 移動
      s.obstacles.forEach((o) => { o.x -= SPEED })
      s.coins.forEach((c) => { c.x -= SPEED })
      s.obstacles = s.obstacles.filter((o) => o.x > -60)
      s.coins = s.coins.filter((c) => c.x > -60 && c.alive)

      // 碰撞
      const px = s.player.x, py = s.player.y
      let hit = false
      s.obstacles.forEach((o) => {
        if (px < o.x + o.w - 4 && px + PLAYER_W - 4 > o.x + 4 &&
            py < o.y + o.h - 4 && py + PLAYER_H - 4 > o.y + 4) hit = true
      })
      s.coins = s.coins.map((c) => {
        if (!c.alive) return c
        const dx = (px + PLAYER_W / 2) - c.x
        const dy = (py + PLAYER_H / 2) - c.y
        if (Math.sqrt(dx * dx + dy * dy) < c.r + 14) {
          s.fund = Math.min(100, s.fund + 10)
          setFund(s.fund)
          return { ...c, alive: false }
        }
        return c
      })
      if (hit && !s.shaking) {
        s.fund = Math.max(0, s.fund - 5)
        setFund(s.fund)
        setShake(true)
        s.shaking = true
        setTimeout(() => { setShake(false); s.shaking = false }, 400)
      }

      // 通關
      if (s.fund >= 100 && !completedRef.current) {
        completedRef.current = true
        s.running = false
        setGameStatus('won')
        completeGame('game1')
      }

      // 背景捲動
      const img = bgImgRef.current
      if (img) {
        const imgDrawW = Math.ceil((img.naturalWidth / img.naturalHeight) * ch) - 1
        s.bgOffset -= SPEED * 0.7
        if (s.bgOffset <= -imgDrawW) s.bgOffset += imgDrawW
      }

      // 繪製
      ctx.clearRect(0, 0, cw, ch)
      drawBg(ctx, cw, ch, groundY, bgImgRef.current, s.bgOffset)
      drawGround(ctx, cw, ch, groundY)
      drawPlayer(ctx, s.player.x, s.player.y, s.frame, spriteImgRef.current)
      s.obstacles.forEach((o) => drawBill(ctx, o, billImgRef.current))
      s.coins.forEach((c) => c.alive && drawCoin(ctx, c, coinImgRef.current))

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [gameStatus, completeGame])

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Fund 進度條 */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(116,185,255,0.7)' }}>Fund Progress</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#1E2749', border: '1.5px solid #4A3018' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${fund}%`, background: 'linear-gradient(to right, #FF8C42, #FFD54F)' }}
          />
        </div>
        <span className="font-bold text-sm w-10 text-right tabular-nums" style={{ color: '#FFD54F' }}>{fund}%</span>
      </div>

      {/* Canvas 容器 — 填滿剩餘高度 */}
      <div
        ref={wrapRef}
        className={`relative flex-1 rounded-2xl overflow-hidden cursor-pointer min-h-0 ${shake ? 'animate-shake' : ''}`}
        style={{ border: '2px solid #4A3018', minHeight: 240, touchAction: 'none' }}
        onPointerDown={(e) => {
          if (gameStatus !== 'running') return
          if (e.pointerType === 'mouse' && e.button !== 0) return
          e.preventDefault()
          jump()
        }}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {gameStatus === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-4 px-6 text-center">
            <div className="max-w-xs">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#FFD54F' }}>Mission 01 / Fund the Journey</p>
              <p className="text-sm leading-relaxed mb-1" style={{ color: 'rgba(255,249,238,0.80)' }}>
                Albums, flights, tickets, outfits. Going to see you isn't cheap.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,249,238,0.65)' }}>
                So it's time to save up. Grab every coin and skip the bills.
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); startGame() }}
                className="px-8 py-3 font-bold rounded-full hover:scale-105 transition-transform text-sm"
                style={{ background: 'linear-gradient(to right, #FF8C42, #FFD54F)', color: '#4A3018', border: '2px solid #4A3018', boxShadow: '0 3px 0 #4A3018' }}
              >
                Start Saving ▶
              </button>
              <p className="text-xs mt-2" style={{ color: 'rgba(116,185,255,0.5)' }}>{jumpHint}</p>
            </div>
          </div>
        )}

        {gameStatus === 'won' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-sm gap-2">
            <p className="text-5xl mb-1">💰</p>
            <p className="font-black text-xl" style={{ color: '#FFD54F' }}>Savings goal hit!</p>
            <p className="text-sm" style={{ color: 'rgba(255,249,238,0.6)' }}>The travel fund is ready.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(116,185,255,0.4)' }}>Coin = savings +10% · Bill = expense -5%</p>
    </div>
  )
}

function drawBg(ctx, cw, ch, groundY, img, bgOffset) {
  if (!img) {
    const grad = ctx.createLinearGradient(0, 0, 0, ch)
    grad.addColorStop(0, '#4c1d95')
    grad.addColorStop(1, '#1e1b4b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, cw, ch)
    return
  }

  // 多畫 1px 重疊消除拼接縫隙
  const imgDrawW = Math.ceil((img.naturalWidth / img.naturalHeight) * ch)
  let x = bgOffset
  while (x < cw) {
    ctx.drawImage(img, x, 0, imgDrawW + 1, ch)
    x += imgDrawW - 1
  }

  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.fillRect(0, 0, cw, ch)
}

function drawGround(ctx, cw, ch, groundY) {
  ctx.fillStyle = '#1E2749'
  ctx.fillRect(0, groundY, cw, ch - groundY)
  ctx.fillStyle = '#4A3018'
  ctx.fillRect(0, groundY, cw, 3)
  ctx.strokeStyle = 'rgba(255,213,79,0.35)'
  ctx.lineWidth = 2
  ctx.setLineDash([20, 15])
  ctx.beginPath()
  ctx.moveTo(0, groundY + 18)
  ctx.lineTo(cw, groundY + 18)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawPlayer(ctx, x, y, frame, sprite) {
  if (!sprite) return

  const frameW = sprite.naturalWidth / SPRITE_FRAMES
  const frameH = sprite.naturalHeight
  const aspect = frameW / frameH
  const destH = PLAYER_H * 1.6
  const destW = destH * aspect
  const srcX = (frame % SPRITE_FRAMES) * frameW

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(
    sprite,
    srcX, 0, frameW, frameH,
    x - (destW - PLAYER_W) / 2,
    y - (destH - PLAYER_H),
    destW, destH
  )
}

function drawBill(ctx, o, img) {
  if (img) {
    const aspect = img.naturalWidth / img.naturalHeight
    const drawH = o.h * 1.4
    const drawW = drawH * aspect
    ctx.drawImage(img, o.x + (o.w - drawW) / 2, o.y + o.h - drawH, drawW, drawH)
  } else {
    ctx.fillStyle = '#fef3c7'
    roundRect(ctx, o.x, o.y, o.w, o.h, 3)
    ctx.fill()
    ctx.fillStyle = '#dc2626'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('¥', o.x + o.w / 2, o.y + o.h - 6)
  }
}

function drawCoin(ctx, c, img) {
  if (img) {
    const size = c.r * 2.4
    ctx.drawImage(img, c.x - size / 2, c.y - size / 2, size, size)
  } else {
    const grad = ctx.createRadialGradient(c.x - 3, c.y - 3, 2, c.x, c.y, c.r)
    grad.addColorStop(0, '#fde68a')
    grad.addColorStop(1, '#d97706')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
