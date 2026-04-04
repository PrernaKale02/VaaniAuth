import AuthFlow from './components/AuthFlow'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import './vaaniauth.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthFlow />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
