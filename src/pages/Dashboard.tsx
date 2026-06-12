import React from 'react'
import { useFinance } from '../store/FinanceContext'

const Dashboard: React.FC = () => {
  const { state } = useFinance()

  const saldo = state.alurKasList.reduce((sum, a) =>
    a.jenis === 'pemasukan' ? sum + a.nominal : sum - a.nominal, 0
  )
  const totalKebutuhan = state.kebutuhanList.reduce((sum, k) => sum + k.nominal, 0)
  const totalUangDiluar = state.uangDiluarList.reduce((sum, u) => sum + u.nominal, 0)

  const selisih = saldo - totalKebutuhan
  const cukup = selisih >= 0

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Rp {saldo.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-2">Dari pencatatan Alur Kas</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Kebutuhan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Rp {totalKebutuhan.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-2">Dari daftar Kebutuhan</p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Uang di Luar</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            Rp {totalUangDiluar.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-gray-400 mt-2">Piutang yang bisa ditarik</p>
        </div>
      </div>

      <div className={`card border-2 ${cukup ? 'border-emerald-400/30 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-400/20' : 'border-red-400/30 bg-red-50/50 dark:bg-red-950/20 dark:border-red-400/20'}`}>
        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">Ringkasan</p>
            {cukup ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                Saldo Anda Cukup — sisa Rp {selisih.toLocaleString('id-ID')}
              </p>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Saldo Anda Kurang Rp {Math.abs(selisih).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
