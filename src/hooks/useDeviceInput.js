import { useState, useEffect } from 'react'

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i

export function isMobileDevice() {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent || ''
  if (MOBILE_UA.test(ua)) return true

  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const touch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
  const narrow = window.innerWidth < 1024

  return touch && coarse && narrow
}

const HINTS = {
  catchMove: {
    mobile: 'Swipe or hold left / right',
    desktop: '← → or A D',
  },
  runnerJump: {
    mobile: 'Tap to jump',
    desktop: 'Space to jump',
  },
  wordOrder: {
    mobile: 'Tap words in order',
    desktop: 'Click words in order',
  },
}

export function getInputHint(key, isMobile) {
  const entry = HINTS[key]
  if (!entry) return ''
  return isMobile ? entry.mobile : entry.desktop
}

export function useDeviceInput() {
  const [isMobile, setIsMobile] = useState(isMobileDevice)

  useEffect(() => {
    const update = () => setIsMobile(isMobileDevice())
    window.addEventListener('resize', update)
    const mq = window.matchMedia('(pointer: coarse)')
    mq.addEventListener?.('change', update)
    return () => {
      window.removeEventListener('resize', update)
      mq.removeEventListener?.('change', update)
    }
  }, [])

  return { isMobile, isDesktop: !isMobile }
}

export function useInputHint(key) {
  const { isMobile } = useDeviceInput()
  return getInputHint(key, isMobile)
}
