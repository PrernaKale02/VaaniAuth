import { useAuth } from '../context/AuthContext'

function riskTone(score) {
  if (score < 35) return '#00a86b'
  if (score < 70) return '#d19200'
  return '#d64545'
}

function riskLabel(score) {
  if (score < 35) return 'Low Risk'
  if (score < 70) return 'Medium Risk'
  return 'High Risk'
}

export default function RiskMeter() {
  const { riskScore } = useAuth()
  const label = riskLabel(riskScore)

  return (
    <section className="card" style={{ marginBottom: 0 }}>
      <div className="row mb8">
        <span className="text-xs" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          Risk Assessment
        </span>
        <span className="badge badge-blue">{label}</span>
      </div>

      <div className="row" style={{ marginBottom: 10 }}>
        <span className="text-sm">Current risk score</span>
        <strong style={{ color: 'var(--text)' }}>{riskScore}%</strong>
      </div>

      <div style={{ width: '100%', height: 10, background: 'var(--border)', borderRadius: 999 }}>
        <div
          style={{
            width: `${riskScore}%`,
            height: '100%',
            borderRadius: 999,
            background: riskTone(riskScore),
            transition: 'width 300ms ease',
          }}
        />
      </div>
    </section>
  )
}
