import mainBg from '../assets/main.png'
import { useGame, PHASES } from '../context/GameContext'

import imgK        from '../assets/member/k.png'
import imgFuma     from '../assets/member/fuma.png'
import imgJo       from '../assets/member/jo.png'
import imgHarua    from '../assets/member/harua.png'
import imgTaki     from '../assets/member/taki.png'
import imgMaki     from '../assets/member/maki.png'
import imgEJ       from '../assets/member/ej.png'
import imgYuma     from '../assets/member/yuma.png'
import imgNicholas from '../assets/member/nicholas.png'

const MEMBERS = [
  { name: 'K',        img: imgK,        color: '#94a3b8' },
  { name: 'Fuma',     img: imgFuma,     color: '#fb923c' },
  { name: 'Nicholas', img: imgNicholas, color: '#818cf8' },
  { name: 'EJ', img: imgEJ, color: '#facc15' },
  { name: 'Yuma', img: imgYuma, color: '#2dd4bf' },
  { name: 'Jo',       img: imgJo,       color: '#4ade80' },
  { name: 'Harua',    img: imgHarua,    color: '#38bdf8' },
  { name: 'Taki',     img: imgTaki,     color: '#a78bfa' },
  { name: 'Maki',     img: imgMaki,     color: '#f472b6' },


]

export default function StartScreen() {
  const { setCurrentPhase } = useGame()

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#0d2040' }}>
      {/* 全螢幕背景圖 */}
      <img
        src={mainBg}
        alt="Summer Fantasy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated', objectPosition: 'center center' }}
      />

      {/* 上方輕遮罩：讓文字在藍天上可讀，不遮太深 */}
      <div
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(10,24,58,0.58) 0%, transparent 100%)' }}
      />

      {/* 下方遮罩：覆蓋沙灘讓按鈕區清晰 */}
      <div
        className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,24,58,0.80) 0%, rgba(10,24,58,0.20) 60%, transparent 100%)' }}
      />

      {/* ── 頂部標題區（天空）── */}
      <div className="relative z-10 flex flex-col items-center pt-10 px-6 text-center animate-slide-up">
        {/* &TEAM 徽章 */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-semibold tracking-widest uppercase mb-5"
          style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.45)', color: '#fff' }}
        >
          &TEAM Fan Project
        </div>

        {/* 主標題 */}
        <h1 className="font-black leading-tight" style={{ textShadow: '0 3px 18px rgba(10,24,58,0.55)' }}>
          <div className="text-white mb-1 mt-1" style={{ fontSize: 'clamp(1.8rem, 7vw, 3.2rem)' }}>
            The Way to You
          </div>
          <br/>
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(to right, #FFD54F, #FF8C42)',
              filter: 'drop-shadow(0 0 14px rgba(255,180,60,0.65))',
              fontSize: 'clamp(1.1rem, 4vw, 1.9rem)',
              letterSpacing: '0.05em',
            }}
          >
            Summer Fantasy
          </span>
        </h1>
      </div>

      {/* ── 中間成員浮牌（雲層前景）── */}
      <div
        className="relative z-10 flex flex-col items-center mt-auto mb-4 animate-slide-up"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-s px-2">
          {MEMBERS.map((m) => (
            <div
              key={m.name}
              className="rounded-lg overflow-hidden flex-shrink-0"
              style={{ width: 32, height: 32 }}
            >
              <img src={m.img} alt={m.name} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 底部按鈕區（沙灘）── */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 pb-24 px-6 text-center animate-slide-up"
        style={{ animationDelay: '0.5s' }}
      >
        <button
          onClick={() => setCurrentPhase(PHASES.SCROLL_STORY)}
          className="group relative px-12 py-4 rounded-full font-black text-lg tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(to right, #FF8C42, #FFD54F)',
            color: '#4A3018',
            boxShadow: '0 0 0 2px #4A3018, 0 4px 0 #4A3018, 0 0 28px rgba(255,213,79,0.55)',
          }}
        >
          <span className="relative z-10">Start</span>
          <div className="absolute inset-0 rounded-full bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <p className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.30)' }}>
          #andTEAM #KPOPNARA #KPOPNARASUMMERFANTASY
        </p>
      </div>
    </div>
  )
}
