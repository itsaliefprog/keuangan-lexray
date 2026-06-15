import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, Send } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import { supabase } from '../supabaseClient'
import type { UangDiluarItem } from '../types'

const LAST_DATE_KEY = 'lastUangDiluarDate'

const UangDiluar: React.FC = () => {
  const { state, addUangDiluar, deleteUangDiluar, loadUangDiluar } = useFinance()
  const [tanggal, setTanggal] = useState(() => localStorage.getItem(LAST_DATE_KEY) || new Date().toISOString().split('T')[0])
  const [keterangan, setKeterangan] = useState('')
  const [nominal, setNominal] = useState('')

  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UangDiluarItem | null>(null)
  const [modalTanggal, setModalTanggal] = useState('')
  const [modalKeterangan, setModalKeterangan] = useState('')
  const [modalNominal, setModalNominal] = useState('')
  const [modalSubmitting, setModalSubmitting] = useState(false)

  const openEditModal = (item: UangDiluarItem) => {
    setEditingItem(item)
    setModalTanggal(item.tanggal)
    setModalKeterangan(item.keterangan)
    setModalNominal(String(item.nominal))
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setModalTanggal('')
    setModalKeterangan('')
    setModalNominal('')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !modalTanggal || !modalKeterangan.trim() || !modalNominal) return
    setModalSubmitting(true)

    const parsedNominal = Number(modalNominal.replace(/\./g, ''))

    const { error } = await supabase
      .from('uang_di_luar')
      .update({
        tanggal: modalTanggal,
        keterangan: modalKeterangan.trim(),
        nominal: parsedNominal,
      })
      .eq('id', editingItem.id)

    if (error) {
      console.log('Error Update:', error)
      setModalSubmitting(false)
      return
    }

    await loadUangDiluar()
    setModalSubmitting(false)
    closeEditModal()
  }

  const handleDeleteRow = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteUangDiluar(id)
    await loadUangDiluar()
    setActiveRowId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal || !keterangan.trim() || !nominal) return

    const parsedNominal = Number(nominal.replace(/\./g, ''))
    await addUangDiluar({ tanggal, keterangan: keterangan.trim(), nominal: parsedNominal })
    localStorage.setItem(LAST_DATE_KEY, tanggal)

    setKeterangan('')
    setNominal('')
  }

  const totalUangDiluar = state.uangDiluarList.reduce((sum, u) => sum + u.nominal, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
        <Send className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        Uang di Luar
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Keterangan</label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nominal</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp.</span>
            <input
              type="text"
              inputMode="numeric"
              value={nominal}
              onChange={(e) => setNominal(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
              className="input pl-11"
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Tambah Uang di Luar
        </button>
      </form>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Keterangan</th>
                <th className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {state.uangDiluarList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    Belum ada data uang di luar.
                  </td>
                </tr>
              ) : (
                [...state.uangDiluarList].reverse().map((u) => (
                  <React.Fragment key={u.id}>
                    <tr
                      onClick={() => setActiveRowId(activeRowId === u.id ? null : u.id)}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30 ${
                        activeRowId === u.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{u.tanggal}</td>
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{u.keterangan}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-gray-200">
                        Rp {u.nominal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    {activeRowId === u.id && (
                      <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                        <td colSpan={3} className="py-2 px-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(u.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-zinc-700">
                <td colSpan={2} className="py-3 px-3 text-sm font-semibold text-gray-900 dark:text-gray-200">Total Uang di Luar</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {totalUangDiluar.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditModal} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Uang di Luar</h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Tanggal</label>
                <input
                  type="date"
                  value={modalTanggal}
                  onChange={(e) => setModalTanggal(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Keterangan</label>
                <input
                  type="text"
                  value={modalKeterangan}
                  onChange={(e) => setModalKeterangan(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nominal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp.</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={modalNominal}
                    onChange={(e) => setModalNominal(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                    className="input pl-11"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={modalSubmitting} className="btn-primary flex-1">
                  {modalSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={closeEditModal} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UangDiluar
