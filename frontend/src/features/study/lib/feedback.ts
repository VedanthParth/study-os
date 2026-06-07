/**
 * Gentle, non-intrusive feedback for the end of a study session.
 *
 * A study timer should never end silently. These helpers are intentionally
 * lightweight and best-effort: a soft Web Audio chime (no asset to download)
 * and an optional browser notification. Everything is wrapped so a missing or
 * blocked API degrades quietly rather than throwing.
 */

/**
 * Play a soft two-note chime using the Web Audio API. Calm bell-like tones with
 * a gentle fade — closer to a glass tap than an alarm.
 */
export function playCompletionChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime
    // A rising perfect fourth (C6 → F6) — quietly affirming.
    const notes = [
      { freq: 1046.5, at: 0 },
      { freq: 1396.9, at: 0.16 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = note.freq

      const start = now + note.at
      // Soft attack, long gentle release — never abrupt.
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.14, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 1)
    }

    // Release the context shortly after the sound finishes.
    window.setTimeout(() => void ctx.close().catch(() => {}), 1500)
  } catch {
    /* Audio is a nicety — never let it break the app. */
  }
}

/**
 * Ask for notification permission once, politely. Best called from a user
 * gesture (e.g. starting a session) so the prompt has clear context.
 */
export function ensureNotificationPermission(): void {
  try {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') void Notification.requestPermission()
  } catch {
    /* no-op */
  }
}

/**
 * Show a calm completion notification, if the user has granted permission.
 */
export function notifySessionComplete(body: string): void {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    new Notification('Study session complete', {
      body,
      // Avoid OS sound stacking on top of our chime.
      silent: true,
    })
  } catch {
    /* no-op */
  }
}
