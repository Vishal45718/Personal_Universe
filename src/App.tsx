import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */

const STORAGE_KEYS = {
  name: 'universe-name',
  mission: 'universe-mission',
  missionDone: 'universe-mission-done',
} as const

const UNIVERSE_MESSAGES = [
  'You are not a drop in the ocean. You are the entire ocean in a drop.',
  'The cosmos is within us. We are made of star-stuff.',
  'Every moment is a fresh beginning — the universe is still expanding, and so are you.',
  'You are exactly where you need to be. Trust the trajectory.',
  'Somewhere, a star burned for billions of years just so your atoms could exist.',
  'The universe didn\'t need to be beautiful, but it is. So are you.',
  'Rest if you must, but don\'t quit. Even galaxies take eons to form.',
  'Your potential is not behind you. It\'s in the next line of code, the next deep breath.',
  'The same force that moves the tides moves through you. Don\'t underestimate it.',
  'Not every day needs to be productive. Some days are for orbiting, not launching.',
  'You have survived every difficult day so far. That\'s a perfect record.',
  'Small steps still cover distance. Even light takes time to cross the void.',
  'The universe rewards curiosity. Keep asking. Keep building.',
  'You are the universe experiencing itself — make it a good experience.',
  'Entropy is inevitable, but creation is a choice. Choose to create today.',
  'A single photon can travel for 13 billion years and still arrive. Be patient with yourself.',
  'Complexity arises from simple rules repeated with care. One commit at a time.',
] as const

interface LaunchSite {
  name: string
  url: string
  icon: string
  site: string
}

const LAUNCH_SITES: LaunchSite[] = [
  { name: 'GitHub', url: 'https://github.com', icon: '⌨', site: 'github' },
  { name: 'LeetCode', url: 'https://leetcode.com', icon: '🧩', site: 'leetcode' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '✦', site: 'chatgpt' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶', site: 'youtube' },
]

/* ═══════════════════════════════════════════════
   Utility hooks
   ═══════════════════════════════════════════════ */

function useLocalStorage(key: string, fallback: string): [string, (v: string) => void] {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) ?? fallback }
    catch { return fallback }
  })
  const set = useCallback((v: string) => {
    setValue(v)
    try { localStorage.setItem(key, v) } catch { /* quota */ }
  }, [key])
  return [value, set]
}

function useLocalStorageBool(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? stored === 'true' : fallback
    }
    catch { return fallback }
  })
  const set = useCallback((v: boolean) => {
    setValue(v)
    try { localStorage.setItem(key, String(v)) } catch { /* quota */ }
  }, [key])
  return [value, set]
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function getGreeting(hour: number): string {
  if (hour < 5) return 'The stars are with you'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'The stars are with you'
}

function formatTime(d: Date): { h: string; m: string; s: string } {
  const h = d.getHours()
  const hh = h % 12 || 12
  return {
    h: String(hh),
    m: String(d.getMinutes()).padStart(2, '0'),
    s: String(d.getSeconds()).padStart(2, '0'),
  }
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getAmPm(d: Date): string {
  return d.getHours() >= 12 ? 'PM' : 'AM'
}

/* ═══════════════════════════════════════════════
   Starfield (Canvas, performance-optimized)
   ═══════════════════════════════════════════════ */

function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respect reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotion = mq.matches

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    // Generate stars
    const STAR_COUNT = Math.min(200, Math.floor((width * height) / 6000))
    interface Star {
      x: number
      y: number
      r: number
      baseAlpha: number
      twinkleSpeed: number
      twinkleOffset: number
    }

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.003 + 0.001,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    let animId: number
    let lastTime = 0
    const FPS_INTERVAL = 1000 / 30 // Cap at 30fps for efficiency

    function draw(timestamp: number) {
      const elapsed = timestamp - lastTime
      if (elapsed < FPS_INTERVAL) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTime = timestamp - (elapsed % FPS_INTERVAL)

      ctx!.clearRect(0, 0, width, height)

      for (const star of stars) {
        const alpha = reducedMotion
          ? star.baseAlpha
          : star.baseAlpha + Math.sin(timestamp * star.twinkleSpeed + star.twinkleOffset) * 0.2

        ctx!.beginPath()
        ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(200, 200, 240, ${Math.max(0, Math.min(1, alpha))})`
        ctx!.fill()
      }

      animId = requestAnimationFrame(draw)
    }

    if (!reducedMotion) {
      animId = requestAnimationFrame(draw)
    } else {
      // Draw once for static stars
      draw(0)
    }

    function handleResize() {
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = width
      canvas!.height = height
      // Redistribute stars
      for (const star of stars) {
        star.x = Math.random() * width
        star.y = Math.random() * height
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas className="starfield-canvas" aria-hidden="true" ref={canvasRef} />
}

/* ═══════════════════════════════════════════════
   App Component
   ═══════════════════════════════════════════════ */

export default function App() {
  const now = useClock()
  const time = formatTime(now)
  const ampm = getAmPm(now)
  const dateStr = formatDate(now)
  const greeting = getGreeting(now.getHours())

  // Persisted state
  const [name, setName] = useLocalStorage(STORAGE_KEYS.name, 'Explorer')
  const [mission, setMission] = useLocalStorage(STORAGE_KEYS.mission, '')
  const [missionDone, setMissionDone] = useLocalStorageBool(STORAGE_KEYS.missionDone, false)

  // UI state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [messageIndex, setMessageIndex] = useState(-1)
  const [messageKey, setMessageKey] = useState(0) // for re-triggering animation

  const settingsPanelRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)

  // Close settings on Escape or outside click
  useEffect(() => {
    if (!settingsOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSettingsOpen(false)
        settingsButtonRef.current?.focus()
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(e.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [settingsOpen])

  const cycleMessage = useCallback(() => {
    setMessageIndex(prev => (prev + 1) % UNIVERSE_MESSAGES.length)
    setMessageKey(k => k + 1)
  }, [])

  const toggleMission = useCallback(() => {
    setMissionDone(!missionDone)
  }, [missionDone, setMissionDone])

  return (
    <>
      {/* Background layers */}
      <div className="universe-bg" aria-hidden="true" />
      <Starfield />
      <div className="ambient-orb ambient-orb-1" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-2" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-3" aria-hidden="true" />

      {/* Main content */}
      <main className="universe-main">
        {/* ── Clock ── */}
        <section className="clock-section" aria-label="Clock and greeting">
          <p className="clock-greeting">
            {greeting}, <span className="name-highlight">{name}</span>
          </p>
          <div
            className="clock-time"
            role="timer"
            aria-label={`Current time: ${time.h}:${time.m}:${time.s} ${ampm}`}
          >
            {time.h}:{time.m}
            <span className="clock-seconds">{time.s}</span>
            <span className="clock-seconds" style={{ fontSize: '0.35em', marginLeft: '6px' }}>
              {ampm}
            </span>
          </div>
          <p className="clock-date">{dateStr}</p>
        </section>

        {/* ── Daily Mission ── */}
        <section className="mission-card" aria-label="Daily mission">
          <div className="mission-header">
            <span className="mission-label">Today's Mission</span>
            <button
              type="button"
              className={`mission-toggle ${missionDone ? 'completed' : ''}`}
              onClick={toggleMission}
              aria-pressed={missionDone}
              aria-label={missionDone ? 'Mark mission as incomplete' : 'Mark mission as complete'}
            >
              <span className="check-icon" aria-hidden="true">
                {missionDone ? '✓' : ''}
              </span>
              {missionDone ? 'Done' : 'Mark done'}
            </button>
          </div>
          <textarea
            className={`mission-input ${missionDone ? 'completed-text' : ''}`}
            value={mission}
            onChange={e => setMission(e.target.value)}
            placeholder="What's your mission for today?"
            aria-label="Daily mission text"
            rows={1}
          />
        </section>

        {/* ── Quick Launch ── */}
        <nav className="launch-section" aria-label="Quick launch links">
          <p className="launch-section-title">Quick Launch</p>
          <div className="launch-grid">
            {LAUNCH_SITES.map(site => (
              <a
                key={site.site}
                className="launch-card"
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                data-site={site.site}
                aria-label={`Open ${site.name}`}
              >
                <span className="launch-icon" aria-hidden="true">{site.icon}</span>
                <span className="launch-name">{site.name}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* ── Universe Message ── */}
        <section className="universe-message-section" aria-label="Universe message">
          <button
            type="button"
            className="universe-message-btn"
            onClick={cycleMessage}
            aria-label="Get a message from the universe"
          >
            <span>✦ Message from the Universe</span>
          </button>
          {messageIndex >= 0 && (
            <p className="universe-message-text" key={messageKey} aria-live="polite">
              "{UNIVERSE_MESSAGES[messageIndex]}"
            </p>
          )}
        </section>
      </main>

      {/* ── Settings ── */}
      <button
        type="button"
        ref={settingsButtonRef}
        className="settings-toggle"
        onClick={() => setSettingsOpen(o => !o)}
        aria-expanded={settingsOpen}
        aria-label="Settings"
        aria-controls="settings-panel"
      >
        ⚙
      </button>

      {settingsOpen && (
        <div
          id="settings-panel"
          ref={settingsPanelRef}
          className="settings-panel"
          role="dialog"
          aria-label="Settings"
        >
          <p className="settings-title">Settings</p>
          <div className="settings-field">
            <label htmlFor="settings-name">Display Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={30}
            />
          </div>
          <div className="settings-field">
            <label htmlFor="settings-mission">Daily Mission</label>
            <textarea
              id="settings-mission"
              value={mission}
              onChange={e => setMission(e.target.value)}
              placeholder="What's your focus today?"
              maxLength={200}
            />
          </div>
        </div>
      )}
    </>
  )
}
