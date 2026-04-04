import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(undefined)

export const AUTH_STATUS = {
  IDLE: 'idle',
  RECORDING: 'recording',
  VERIFYING: 'verifying',
  SUCCESS: 'success',
  FAILED: 'failed',
}

export const SESSION_STATUS = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  EXPIRED: 'expired',
}

function clampRiskScore(value) {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, numericValue))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.IDLE)
  const [riskScore, setRiskScoreState] = useState(0)
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUS.INACTIVE)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.navigator.onLine
  })

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  function updateRiskScore(nextScore) {
    setRiskScoreState(clampRiskScore(nextScore))
  }

  function resetAuthState() {
    setAuthStatus(AUTH_STATUS.IDLE)
    setRiskScoreState(0)
  }

  function clearSession() {
    setUser(null)
    setSessionStatus(SESSION_STATUS.INACTIVE)
    resetAuthState()
  }

  const value = useMemo(
    () => ({
      user,
      setUser,
      authStatus,
      setAuthStatus,
      riskScore,
      setRiskScore: updateRiskScore,
      sessionStatus,
      setSessionStatus,
      isOnline,
      setIsOnline,
      resetAuthState,
      clearSession,
      isAuthenticated: authStatus === AUTH_STATUS.SUCCESS,
    }),
    [authStatus, isOnline, riskScore, sessionStatus, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
