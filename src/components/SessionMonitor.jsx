import { useAuth } from '../context/AuthContext'

export default function SessionMonitor() {
  const { sessionStatus, authStatus, user, isOnline } = useAuth()

  return (
    <section className="card" style={{ marginBottom: 0 }}>
      <div className="row mb8">
        <span className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Session Monitor
        </span>
        <span className={isOnline ? 'badge badge-teal' : 'badge badge-red'}>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <div className="row" style={{ marginBottom: 8 }}>
        <span className="text-sm">User</span>
        <span className="text-sm">{user?.name ?? 'Guest'}</span>
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="text-sm">Auth status</span>
        <span className="text-sm" style={{ textTransform: 'capitalize' }}>
          {authStatus}
        </span>
      </div>
      <div className="row">
        <span className="text-sm">Session</span>
        <span className="text-sm" style={{ textTransform: 'capitalize' }}>
          {sessionStatus}
        </span>
      </div>
    </section>
  )
}
