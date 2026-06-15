import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, FileText } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import { supabase } from '../supabaseClient'
import type { KebutuhanItem } from '../types'

const Kebutuhan: React.FC = () => {
  const { state, addKebutuhan, deleteKebutuhan, deleteAllKebutuhan, loadKebutuhan } = useFinance()
  const [rincian, setRincian] = useState('')
  const [nominal, setNominal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KebutuhanItem | null>(null)
  const [modalRincian, setModalRincian] = useState('')
  const [modalNominal, setModalNominal] = useState('')
  const [modalSubmitting, setModalSubmitting] = useState(false)

  const openEditModal = (item: KebutuhanItem) => {
    setEditingItem(item)
    setModalRincian(item.rincian)
    setModalNominal(String(item.nominal))
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setModalRincian('')
    setModalNominal('')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !modalRincian.trim() || !modalNominal) return
    setModalSubmitting(true)

    const parsedNominal = Number(modalNominal.replace(/\./g, ''))

    const { error } = await supabase
      .from('kebutuhan')
      .update({
        rincian: modalRincian.trim(),
        nominal: parsedNominal,
      })
      .eq('id', editingItem.id)

    if (error) {
      console.log('Error Update:', error)
      setModalSubmitting(false)
      return
    }

    await loadKebutuhan()
    setModalSubmitting(false)
    closeEditModal()
  }

  const handleDeleteRow = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteKebutuhan(id)
    await loadKebutuhan()
    setActiveRowId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rincian.trim() || !nominal) return
    setSubmitting(true)

    const parsedNominal = Number(nominal.replace(/\./g, ''))
    const tanggal = new Date().toISOString().split('T')[0]
    await addKebutuhan({ tanggal, rincian: rincian.trim(), nominal: parsedNominal })

    setRincian('')
    setNominal('')
    setSubmitting(false)
  }

  const totalKebutuhan = state.kebutuhanList.reduce((sum, k) => sum + k.nominal, 0)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
        <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        Kebutuhan
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Rincian</label>
          <input
            type="text"
            value={rincian}
            onChange={(e) => setRincian(e.target.value)}
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
        <button type="submit" disabled={submitting} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          {submitting ? 'Menyimpan...' : 'Tambah Kebutuhan'}
        </button>
      </form>

      <div className="card">
        {state.kebutuhanList.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Daftar Kebutuhan</h3>
            <button
              onClick={async () => {
                if (window.confirm('Hapus semua data kebutuhan? Tindakan ini tidak dapat dibatalkan.'))
                  await deleteAllKebutuhan()
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Hapus Semua
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rincian</th>
                <th className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {state.kebutuhanList.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    Belum ada kebutuhan.
                  </td>
                </tr>
              ) : (
                [...state.kebutuhanList].reverse().map((k) => (
                  <React.Fragment key={k.id}>
                    <tr
                      onClick={() => setActiveRowId(activeRowId === k.id ? null : k.id)}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30 ${
                        activeRowId === k.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{k.rincian}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-gray-200">
                        Rp {k.nominal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    {activeRowId === k.id && (
                      <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                        <td colSpan={2} className="py-2 px-3">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditModal(k)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(k.id)}
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
                <td className="py-3 px-3 text-sm font-semibold text-gray-900 dark:text-gray-200">Total Kebutuhan</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {totalKebutuhan.toLocaleString('id-ID')}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Kebutuhan</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Rincian</label>
                <input
                  type="text"
                  value={modalRincian}
                  onChange={(e) => setModalRincian(e.target.value)}
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

export default Kebutuhan
