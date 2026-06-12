import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Repeat,
  Send,
  Menu,
  X,
  Layers,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useFinance } from '../store/FinanceContext'

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Kebutuhan', icon: ClipboardList, path: '/kebutuhan' },
  { label: 'Alur Kas', icon: Repeat, path: '/alur-kas' },
  { label: 'Uang di Luar', icon: Send, path: '/uang-di-luar' },
]

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { state } = useFinance()
  const navigate = useNavigate()
  const location = useLocation()

  const saldo = state.alurKasList.reduce((sum, a) =>
    a.jenis === 'pemasukan' ? sum + a.nominal : sum - a.nominal, 0
  )
  const totalKebutuhan = state.kebutuhanList.reduce((sum, k) => sum + k.nominal, 0)
  const selisih = saldo - totalKebutuhan

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          dark:bg-zinc-950 dark:border-zinc-800
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-400/10">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-semibold text-base text-gray-900 dark:text-white tracking-tight">
              Keuangan Lexray
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${
                    isActive
                      ? 'bg-emerald-400/10 text-emerald-400 border-l-2 border-emerald-400 rounded-l-none'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-zinc-800/50 dark:hover:text-gray-200'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 dark:border-zinc-800">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 p-4 space-y-3">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Ringkasan
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Kebutuhan</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                  Rp {totalKebutuhan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Saldo Tersedia</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-200">
                  Rp {saldo.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Selisih</span>
                <span className={`text-xs font-bold ${selisih >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  Rp {Math.abs(selisih).toLocaleString('id-ID')}
                  {selisih < 0 && ' (defisit)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-zinc-800/50 dark:hover:text-gray-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden dark:bg-zinc-950 dark:border-zinc-800">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Keuangan Lexray
            </h1>
            <button
              onClick={toggleTheme}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="px-4 pt-6 pb-4 lg:px-6 lg:pb-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
