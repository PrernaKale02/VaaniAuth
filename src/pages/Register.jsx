import { useMemo, useState } from 'react'
import ChallengePhrase from '../components/ChallengePhrase'
import VoiceRecorder from '../components/VoiceRecorder'
import { AUTH_STATUS, SESSION_STATUS, useAuth } from '../context/AuthContext'

const PHRASES = [
  {
    text: 'My voice is my passport',
    hint: 'Primary authentication phrase',
  },
  {
    text: 'Authorize this transaction now',
    hint: 'Payment confirmation phrase',
  },
  {
    text: 'VaaniAuth security check',
    hint: 'Backup verification phrase',
  },
]

export default function Register({ onBack, onRegistered }) {
  const { authStatus, setAuthStatus, setRiskScore, setSessionStatus, setUser } = useAuth()
  const [step, setStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  const currentPhrase = PHRASES[step]
  const isComplete = step >= PHRASES.length

  const statusInfo = useMemo(() => {
    if (isRecording) {
      return { tone: 'red', text: 'Listening...' }
    }

    if (isComplete) {
      return { tone: 'teal', text: 'All phrases recorded!' }
    }

    if (step === 0) {
      return { tone: 'blue', text: 'Ready to record' }
    }

    return { tone: 'teal', text: `Phrase ${step} of ${PHRASES.length} saved` }
  }, [isComplete, isRecording, step])

  function handleStartRecording() {
    if (isComplete) {
      return
    }

    setIsRecording(true)
    setAuthStatus(AUTH_STATUS.RECORDING)

    window.setTimeout(() => {
      setIsRecording(false)
      setStep((currentStep) => currentStep + 1)
      setAuthStatus(AUTH_STATUS.IDLE)
    }, 2200)
  }

  function handleStopRecording() {
    if (!isComplete) {
      return
    }

    setAuthStatus(AUTH_STATUS.VERIFYING)
    onRegistered?.(() => {
      setUser({ id: '1', name: 'Arjun Mehta' })
      setRiskScore(12)
      setSessionStatus(SESSION_STATUS.ACTIVE)
      setAuthStatus(AUTH_STATUS.SUCCESS)
    })
  }

  return (
    <section className="screen" id="s-register">
      <div className="status-bar">
        <div className="status-icons" />
      </div>
      <div className="header">
        <button className="back-btn" onClick={onBack} type="button">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <polyline points="15,18 9,12 15,6" />
          </svg>
          Back
        </button>
        <div className="brand" style={{ marginTop: 14 }}>
          Step {Math.min(step + 1, PHRASES.length)} of {PHRASES.length}
        </div>
        <div className="page-title">Voice Registration</div>
        <div className="page-sub">Say each phrase clearly when prompted</div>
      </div>

      <div className="content">
        <div className="step-dots">
          {PHRASES.map((_, index) => {
            const className = `dot${index === step && !isComplete ? ' active' : ''}${index < step ? ' done' : ''}`
            return <div key={index} className={className} />
          })}
        </div>

        <div style={{ height: 16 }} />
        {PHRASES.map((phrase, index) => {
          const className = `phrase-card${index === step && !isComplete ? ' active' : ''}${index < step ? ' done' : ''}`
          const numClass = `phrase-num${index === step && !isComplete ? ' active' : ''}${index < step ? ' done' : ''}`

          return (
            <div key={phrase.text} className={className}>
              <div className={numClass}>{index < step ? <span className="check">✓</span> : index + 1}</div>
              <div className="phrase-text">
                <strong>&quot;{phrase.text}&quot;</strong>
                {phrase.hint}
              </div>
            </div>
          )
        })}

        <div style={{ height: 16 }} />
        <ChallengePhrase phrase={currentPhrase?.text ?? PHRASES[PHRASES.length - 1].text} caption="Say this phrase" />

        <div style={{ marginTop: 16 }}>
          <VoiceRecorder
            isRecording={isRecording}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            statusText={statusInfo.text}
            statusTone={statusInfo.tone}
            waveBars={16}
            waveTone="teal"
            disabled={authStatus === AUTH_STATUS.VERIFYING}
            label="Record registration phrase"
          />
        </div>
      </div>

      <div className="bottom">
        <button
          type="button"
          className="btn btn-primary"
          onClick={isComplete ? handleStopRecording : handleStartRecording}
          disabled={isRecording || authStatus === AUTH_STATUS.VERIFYING}
        >
          {isRecording ? 'Recording...' : isComplete ? 'Complete Registration' : `Record Phrase ${step + 1}`}
        </button>
      </div>
    </section>
  )
}
