import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { FinanceProvider } from './store/FinanceContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Kebutuhan from './pages/Kebutuhan'
import AlurKas from './pages/AlurKas'
import UangDiluar from './pages/UangDiluar'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#121212' }}>
        <div className="flex items-center justify-center min-h-screen">
          <img
            src="/loading-logo.png"
            alt="Lexray"
            className="w-32 h-32 md:w-40 md:h-40 animate-pulse"
          />
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <FinanceProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kebutuhan" element={<Kebutuhan />} />
          <Route path="/alur-kas" element={<AlurKas />} />
          <Route path="/uang-di-luar" element={<UangDiluar />} />
        </Routes>
      </Layout>
    </FinanceProvider>
  )
}

export default App
