import { useEffect } from 'react'

import { useStudyStore } from '../store'

/**
 * Drives the 1-second tick for the active study timer.
 * Attach this hook once in the component that owns the active session UI.
 */
export function useStudyTimer() {
  const timerStatus = useStudyStore((s) => s.timer.status)
  const tick = useStudyStore((s) => s.tick)

  useEffect(() => {
    if (timerStatus !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [timerStatus, tick])
}
