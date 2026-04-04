import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { AUTH_STATUS, SESSION_STATUS, useAuth } from '../context/AuthContext'
import OfflineToggle from './OfflineToggle'
import RiskMeter from './RiskMeter'
import SessionMonitor from './SessionMonitor'

export default function AuthFlow() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState('welcome')
  const [processing, setProcessing] = useState({ show: false, title: '', subtitle: '' })
  const { setAuthStatus, sessionStatus, setSessionStatus } = useAuth()

  function runProcessing(title, subtitle, duration, callback) {
    setProcessing({ show: true, title, subtitle })
    window.setTimeout(() => {
      setProcessing({ show: false, title: '', subtitle: '' })
      callback?.()
    }, duration)
  }

  function handleRegistrationComplete(commitSuccessState) {
    runProcessing('Registering Voice...', 'Saving voiceprint securely', 1800, () => {
      commitSuccessState?.()
      setScreen('success')
    })
  }

  function handleVerification({ onSuccess, onFailure }) {
    runProcessing('Analyzing Voice...', 'Running biometric match', 2000, () => {
      if (sessionStatus === SESSION_STATUS.EXPIRED) {
        onFailure?.()
        setScreen('fail')
        return
      }

      onSuccess?.()
      setScreen('success')
    })
  }

  function goToWelcome() {
    setAuthStatus(AUTH_STATUS.IDLE)
    setScreen('welcome')
  }

  function openLogin() {
    setSessionStatus(SESSION_STATUS.INACTIVE)
    setAuthStatus(AUTH_STATUS.IDLE)
    setScreen('login')
  }

  function openRegister() {
    setAuthStatus(AUTH_STATUS.IDLE)
    setScreen('register')
  }

  function openDashboard() {
    navigate('/dashboard')
  }

  function renderPrimaryScreen() {
    if (screen === 'register') {
      return <Register onBack={goToWelcome} onRegistered={handleRegistrationComplete} />
    }

    if (screen === 'login') {
      return (
        <Login
          onBack={goToWelcome}
          onVerified={handleVerification}
          onFailed={() => {
            setAuthStatus(AUTH_STATUS.FAILED)
            setScreen('fail')
          }}
        />
      )
    }

    if (screen === 'success') {
      return (
        <section className="screen" id="s-success">
          <div className="status-bar">
            <div className="status-icons" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <div className="result-circle success" style={{ marginBottom: 24 }}>
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
                <polyline
                  className="check-path"
                  points="14,26 22,34 38,18"
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, textAlign: 'center', color: 'var(--text)', marginBottom: 8 }}>
              Voice Verified
            </div>
            <div style={{ fontSize: 15, color: 'var(--text2)', textAlign: 'center', marginBottom: 24 }}>
              Identity confirmed. Session secured.
            </div>
            <div className="badge badge-teal" style={{ marginBottom: 24 }}>
              Authentication Successful
            </div>
          </div>
          <div className="bottom">
            <button className="btn btn-teal" type="button" onClick={openDashboard}>
              Go to Dashboard
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} type="button" onClick={goToWelcome}>
              Back to Home
            </button>
          </div>
        </section>
      )
    }

    if (screen === 'fail') {
      return (
        <section className="screen" id="s-fail">
          <div className="status-bar">
            <div className="status-icons" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
            <div className="result-circle fail" style={{ marginBottom: 24 }}>
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" fill="none" stroke="var(--danger)" strokeWidth="1.5" />
                <line x1="17" y1="17" x2="35" y2="35" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
                <line x1="35" y1="17" x2="17" y2="35" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, textAlign: 'center', color: 'var(--text)', marginBottom: 8 }}>
              Verification Failed
            </div>
            <div style={{ fontSize: 15, color: 'var(--text2)', textAlign: 'center', marginBottom: 24 }}>
              Voice not recognized. Please try again.
            </div>
            <div className="badge badge-red" style={{ marginBottom: 24 }}>
              Authentication Failed
            </div>
          </div>
          <div className="bottom">
            <button className="btn btn-primary" type="button" onClick={openLogin}>
              Try Again
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 10 }} type="button" onClick={goToWelcome}>
              Back to Home
            </button>
          </div>
        </section>
      )
    }

    return (
      <section className="screen" id="s-welcome">
        <div className="status-bar">
          <div className="status-icons">
            <div className="status-dot" />
            <div className="status-dot" />
            <div className="status-dot" />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'linear-gradient(145deg,#0e2a56,var(--navy3))',
              border: '0.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              position: 'relative',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <div
            style={{
              fontFamily: 'Syne',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 3,
              color: 'var(--teal)',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            VaaniAuth
          </div>
          <div
            style={{
              fontFamily: 'Syne',
              fontSize: 32,
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.1,
              color: 'var(--text)',
              marginBottom: 12,
            }}
          >
            Your Voice.
            <br />
            Your Bank.
          </div>
          <div style={{ fontSize: 15, color: 'var(--text2)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
            Advanced voice biometrics for secure, passwordless banking authentication.
          </div>
        </div>
        <div className="bottom">
          <button className="btn btn-primary" onClick={openRegister} type="button">
            Register Voice
          </button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={openLogin} type="button">
            Sign In
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="app" id="app">
      {renderPrimaryScreen()}

      <div className="content" style={{ paddingTop: 18 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <OfflineToggle />
          <SessionMonitor />
          <RiskMeter />
        </div>
      </div>

      {processing.show ? (
        <div className="processing-overlay" id="processing">
          <div className="voice-ring-anim">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{processing.title}</div>
          <div className="processing-text">{processing.subtitle}</div>
        </div>
      ) : null}
    </div>
  )
}
