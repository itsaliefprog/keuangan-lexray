import { Routes, Route } from 'react-router-dom'
import { FinanceProvider } from './store/FinanceContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Kebutuhan from './pages/Kebutuhan'
import AlurKas from './pages/AlurKas'
import UangDiluar from './pages/UangDiluar'

function App() {
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
