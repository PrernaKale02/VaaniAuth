import { useAuth } from '../context/AuthContext'

export default function OfflineToggle() {
  const { isOnline, setIsOnline } = useAuth()

  return (
    <div className="card" style={{ marginBottom: 0, padding: 14 }}>
      <div className="row">
        <span className="text-sm">Network simulation</span>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!isOnline}
            onChange={(event) => setIsOnline(!event.target.checked)}
          />
          <span className="text-sm">Offline mode</span>
        </label>
      </div>
    </div>
  )
}
