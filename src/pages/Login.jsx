import { useState } from 'react'
import ChallengePhrase from '../components/ChallengePhrase'
import VoiceRecorder from '../components/VoiceRecorder'
import { AUTH_STATUS, SESSION_STATUS, useAuth } from '../context/AuthContext'

const LOGIN_PHRASE = 'Authorize this transaction now'

export default function Login({ onBack, onVerified, onFailed }) {
  const { authStatus, setAuthStatus, setRiskScore, setSessionStatus, isOnline } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [statusText, setStatusText] = useState('Tap mic to begin')
  const [statusTone, setStatusTone] = useState('blue')

  function handleStartRecording() {
    if (!isOnline) {
      setStatusText('Offline mode enabled')
      setStatusTone('red')
      return
    }

    setIsRecording(true)
    setStatusText('Listening...')
    setStatusTone('red')
    setAuthStatus(AUTH_STATUS.RECORDING)

    window.setTimeout(() => {
      setIsRecording(false)
      setStatusText('Recording complete')
      setStatusTone('teal')
      setAuthStatus(AUTH_STATUS.IDLE)
    }, 2000)
  }

  function handleStopRecording() {
    if (!isOnline) {
      setAuthStatus(AUTH_STATUS.FAILED)
      onFailed?.()
      return
    }

    setIsRecording(false)
    setStatusText('Verifying voiceprint...')
    setStatusTone('blue')
    setAuthStatus(AUTH_STATUS.VERIFYING)

    onVerified?.({
      onSuccess: () => {
        const generatedRisk = 22
        setRiskScore(generatedRisk)
        setSessionStatus(SESSION_STATUS.ACTIVE)
        setStatusText('Voice verified')
        setStatusTone('teal')
        setAuthStatus(AUTH_STATUS.SUCCESS)
      },
      onFailure: () => {
        setRiskScore(86)
        setSessionStatus(SESSION_STATUS.INACTIVE)
        setStatusText('Voice not recognized')
        setStatusTone('red')
        setAuthStatus(AUTH_STATUS.FAILED)
      },
    })
  }

  return (
    <section className="screen" id="s-login">
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
          Authentication
        </div>
        <div className="page-title">Voice Login</div>
        <div className="page-sub">Speak your passphrase to continue</div>
      </div>

      <div className="content">
        <div style={{ height: 20 }} />
        <ChallengePhrase phrase={LOGIN_PHRASE} />

        <div style={{ marginTop: 20 }}>
          <VoiceRecorder
            isRecording={isRecording}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            statusText={statusText}
            statusTone={statusTone}
            disabled={authStatus === AUTH_STATUS.VERIFYING}
            waveBars={18}
            label="Start login recording"
          />
        </div>

        <div style={{ height: 16 }} />
        <div className="card" style={{ marginTop: 8 }}>
          <div className="row mb8">
            <span className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              Security Features
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="row">
              <span className="text-sm">Voice liveness detection</span>
              <span className="badge badge-teal" style={{ fontSize: 10, padding: '4px 10px' }}>
                Active
              </span>
            </div>
            <div className="row">
              <span className="text-sm">Anti-replay protection</span>
              <span className="badge badge-teal" style={{ fontSize: 10, padding: '4px 10px' }}>
                Active
              </span>
            </div>
            <div className="row">
              <span className="text-sm">Ambient noise filtering</span>
              <span className="badge badge-teal" style={{ fontSize: 10, padding: '4px 10px' }}>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom">
        <button
          type="button"
          className="btn btn-primary"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={authStatus === AUTH_STATUS.VERIFYING}
        >
          {isRecording ? 'Stop and Verify' : 'Start Verification'}
        </button>
      </div>
    </section>
  )
}
