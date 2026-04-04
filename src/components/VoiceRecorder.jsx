import { useEffect, useMemo, useState } from 'react'

function createBaseHeights(count) {
  return Array.from({ length: count }, () => 8 + Math.random() * 12)
}

export default function VoiceRecorder({
  isRecording,
  onStart,
  onStop,
  statusText,
  statusTone = 'blue',
  disabled = false,
  waveTone = 'blue',
  waveBars = 18,
  label = 'Toggle voice recorder',
}) {
  const [idleHeights, setIdleHeights] = useState(() => createBaseHeights(waveBars))

  useEffect(() => {
    if (!isRecording) {
      setIdleHeights(createBaseHeights(waveBars))
    }
  }, [isRecording, waveBars])

  const bars = useMemo(() => Array.from({ length: waveBars }, (_, index) => index), [waveBars])
  const statusClassName = `badge badge-${statusTone}`
  const micClassName = `mic-btn${isRecording ? ' recording' : ''}`
  const ringClassName = `mic-ring${isRecording ? ' recording' : ''}`

  function handleClick() {
    if (disabled) {
      return
    }

    if (isRecording) {
      onStop?.()
      return
    }

    onStart?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div className={ringClassName}>
        <div className="pulse-ring ring1" />
        <div className="pulse-ring ring2" />
        <div className="pulse-ring ring3" />
        <button type="button" className={micClassName} onClick={handleClick} aria-label={label} disabled={disabled}>
          <svg viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
      </div>

      <div className="waveform">
        {bars.map((barIndex) => {
          const height = isRecording ? 14 + ((barIndex % 7) + 1) * 4 : idleHeights[barIndex]
          const waveClassName = `wave-bar${waveTone === 'teal' ? ' teal' : ''}${isRecording ? ' active' : ''}`

          return (
            <div
              key={barIndex}
              className={waveClassName}
              style={{ height: `${height}px`, animationDelay: `${barIndex * 0.06}s` }}
            />
          )
        })}
      </div>

      {statusText ? <span className={statusClassName}>{statusText}</span> : null}
    </div>
  )
}
