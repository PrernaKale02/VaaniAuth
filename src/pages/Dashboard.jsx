import { useNavigate } from 'react-router-dom'

const transactions = [
  { id: 1, name: 'Amit Sharma', amount: '-₹500', status: 'Success' },
  { id: 2, name: 'Priya Verma', amount: '+₹2,000', status: 'Success' },
  { id: 3, name: 'Rahul Mehta', amount: '-₹1,250', status: 'Success' },
  { id: 4, name: 'Neha Singh', amount: '-₹320', status: 'Success' },
]

const quickActions = [
  { id: 1, label: 'Send Money' },
  { id: 2, label: 'Request' },
  { id: 3, label: 'Scan & Pay' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="app" id="dashboard-app">
      <section className="screen" id="dashboard-screen">
        <div className="header pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="m-0 text-3xl font-semibold text-[var(--text)]">Dashboard</h1>
              <p className="mt-2 text-sm text-[var(--text2)]">Welcome back</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 10 }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="content pt-2">
          <div className="grid gap-6 md:gap-8">
            <div className="rounded-2xl bg-white/5 p-8 text-center shadow-xl shadow-indigo-500/10 backdrop-blur-lg">
              <p className="text-xs uppercase tracking-wider text-gray-400">AVAILABLE BALANCE</p>
              <p className="mt-2 text-center text-4xl font-bold text-[var(--text)]">₹25,000</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-lg">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-[var(--text)]">Quick Actions</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className="btn btn-ghost"
                    style={{ marginTop: 10 }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 shadow-xl shadow-indigo-500/10 backdrop-blur-lg">
              <h2 className="mb-4 mt-6 text-2xl font-semibold text-[var(--text)]">Recent Transactions</h2>
              <div>
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="mb-3 flex items-center justify-between rounded-xl bg-white/5 p-4 transition duration-300 hover:bg-white/10 last:mb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{transaction.name}</p>
                      <p className="text-sm text-gray-400">{transaction.status}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.amount.startsWith('-') ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {transaction.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
