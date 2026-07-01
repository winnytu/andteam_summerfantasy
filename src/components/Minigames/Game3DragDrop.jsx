import { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { useInputHint } from '../../hooks/useDeviceInput'

const SENTENCES = [
  {
    id: 1,
    words: ['ずっと', '会いたかった', 'です'],
    meaning: 'I have always wanted to see you.',
    hint: 'Longing',
  },
  {
    id: 2,
    words: ['君が', '世界を', '照らしてくれた'],
    meaning: 'You lit up my world.',
    hint: 'Light',
  },
  {
    id: 3,
    words: ['君のことが', '一番', '好きだよ'],
    meaning: 'I like you the most.',
    hint: 'Feeling',
  },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeWordBank(words) {
  return shuffle(words.map((w, i) => ({ id: i, text: w })))
}

export default function Game3DragDrop() {
  const { completeGame, gameProgress } = useGame()
  const orderHint = useInputHint('wordOrder')

  const [sentenceIdx, setSentenceIdx] = useState(0)       // 目前第幾句
  const [selected, setSelected] = useState([])            // 已點擊的詞（按順序）
  const [wordBank, setWordBank] = useState(() => makeWordBank(SENTENCES[0].words))
  const [wrongIdx, setWrongIdx] = useState(null)          // 點錯的 word id（震動）
  const [completedSentences, setCompletedSentences] = useState([]) // 已完成的句子
  const [celebrating, setCelebrating] = useState(false)

  const already = gameProgress.game3
  const current = SENTENCES[sentenceIdx]

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === 'k' || e.key === 'K') && !already) {
        setCompletedSentences([...SENTENCES])
        completeGame('game3')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [already, completeGame])

  const handleWordClick = useCallback((word) => {
    if (celebrating) return

    const expectedIdx = selected.length          // 下一個應填的位置
    const isCorrect = word.text === current.words[expectedIdx]

    if (isCorrect) {
      const newSelected = [...selected, word]
      setSelected(newSelected)

      // 整句完成
      if (newSelected.length === current.words.length) {
        setCelebrating(true)
        setTimeout(() => {
          const newCompleted = [...completedSentences, current]
          setCompletedSentences(newCompleted)
          setCelebrating(false)

          const nextIdx = sentenceIdx + 1
          if (nextIdx < SENTENCES.length) {
            setSentenceIdx(nextIdx)
            setSelected([])
            setWordBank(makeWordBank(SENTENCES[nextIdx].words))
          } else {
            // 全部完成
            completeGame('game3')
          }
        }, 1000)
      }
    } else {
      // 點錯：震動 + 重置
      setWrongIdx(word.id)
      setTimeout(() => {
        setWrongIdx(null)
        setSelected([])
      }, 600)
    }
  }, [selected, current, celebrating, completedSentences, sentenceIdx, completeGame])

  if (already) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-4xl">🌸</p>
        <p className="text-xl font-black" style={{ color: '#FF8C42' }}>All three sentences complete!</p>
        <div className="flex flex-col gap-2 mt-2">
          {SENTENCES.map(s => (
            <p key={s.id} className="text-white/70 text-sm">{s.words.join(' ')} · {s.meaning}</p>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">Game 3 Cleared ✓</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-y-auto">
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto py-4">
      <div className="text-center">
        <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(249,168,212,0.65)' }}>
          I've practised these lines a hundred times.<br />
          Just hoping I don't blank out when I meet you.
        </p>
        <p className="text-xs italic" style={{ color: 'rgba(255,249,238,0.45)' }}>
          "{current.meaning}"
        </p>
      </div>

      {/* 答案槽 */}
      <div className="flex items-center gap-2.5 justify-center flex-wrap">
        {current.words.map((w, i) => {
          const filled = selected[i]
          return (
            <div
              key={i}
              className="min-w-[80px] h-12 rounded-2xl flex items-center justify-center text-base font-bold px-3 transition-all duration-200"
              style={filled
                ? celebrating
                  ? { border: '2px solid #FFD54F', background: 'rgba(255,213,79,0.15)', color: '#FFD54F', boxShadow: '0 0 14px rgba(255,213,79,0.5)' }
                  : { border: '2px solid #4CD137', background: 'rgba(76,209,55,0.12)', color: '#4CD137' }
                : { border: '2px dashed rgba(244,114,182,0.2)', background: 'rgba(244,114,182,0.04)', color: '#4a5568' }}
            >
              {filled ? filled.text : <span className="text-gray-700 text-sm">＿＿</span>}
            </div>
          )
        })}
      </div>

      {/* 提示文字 */}
      <p className="text-center text-[11px]" style={{ color: 'rgba(116,185,255,0.45)' }}>
          {orderHint}
      </p>

      {/* 單字按鈕 */}
      <div className="flex flex-wrap gap-2.5 justify-center">
        {wordBank.map((word) => {
          const isUsed = selected.some(s => s.id === word.id)
          const isWrong = wrongIdx === word.id
          return (
            <button
              key={word.id}
              onClick={() => !isUsed && handleWordClick(word)}
              disabled={isUsed || celebrating}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 select-none ${isWrong ? 'animate-shake' : ''} ${!isUsed && !celebrating ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-not-allowed'}`}
              style={isUsed
                ? { background: 'rgba(30,39,73,0.3)', border: '2px solid rgba(74,48,24,0.2)', color: 'rgba(255,249,238,0.2)' }
                : isWrong
                ? { background: 'rgba(232,65,24,0.15)', border: '2px solid #E84118', color: '#ff6b4a' }
                : { background: 'rgba(116,185,255,0.12)', border: '2px solid #74B9FF', color: '#FFF9EE', boxShadow: '0 0 10px rgba(116,185,255,0.2)' }}
            >
              {word.text}
            </button>
          )
        })}
      </div>
    </div>
    </div>
  )
}
