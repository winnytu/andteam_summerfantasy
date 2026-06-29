import { useGame } from '../../context/GameContext'

export default function HPBar() {
  const { hp } = useGame()

  const getBarStyle = () => {
    if (hp > 60) return { background: 'linear-gradient(to right, #4CD137, #a8ff8a)', boxShadow: '0 0 12px rgba(76,209,55,0.7)' }
    if (hp > 30) return { background: 'linear-gradient(to right, #FFD54F, #FF8C42)', boxShadow: '0 0 12px rgba(255,213,79,0.7)' }
    return { background: 'linear-gradient(to right, #E84118, #ff6b4a)', boxShadow: '0 0 12px rgba(232,65,24,0.7)' }
  }

  const getNumColor = () => {
    if (hp > 60) return '#4CD137'
    if (hp > 30) return '#FFD54F'
    return '#E84118'
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 backdrop-blur-md rounded-full px-4 py-2 min-w-[260px]"
      style={{ background: 'rgba(21,27,52,0.85)', border: '2px solid #4A3018' }}>
      {/* HP 圖示 */}
      <span className="text-lg leading-none select-none" style={{ color: '#E84118' }}>♥</span>

      {/* 標籤 */}
      <span className="text-xs font-semibold tracking-wider uppercase w-6" style={{ color: 'rgba(255,249,238,0.7)' }}>
        HP
      </span>

      {/* 進度條容器 */}
      <div className="flex-1 h-3 rounded-full overflow-hidden relative" style={{ background: '#1E2749' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${hp}%`, ...getBarStyle() }}
        />
        {hp === 100 && (
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
        )}
      </div>

      {/* 數值 */}
      <span className="text-xs font-bold w-8 text-right tabular-nums" style={{ color: getNumColor() }}>
        {hp}%
      </span>
    </div>
  )
}
