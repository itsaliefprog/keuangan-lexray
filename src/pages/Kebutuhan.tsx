import React, { useState } from 'react'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import Modal from '../components/Modal'
import type { KebutuhanItem } from '../types'

const Kebutuhan: React.FC = () => {
  const { state, addKebutuhan, editKebutuhan, deleteKebutuhan, deleteAllKebutuhan } = useFinance()
  const [rincian, setRincian] = useState('')
  const [nominal, setNominal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [selected, setSelected] = useState<KebutuhanItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editRincian, setEditRincian] = useState('')
  const [editNominal, setEditNominal] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rincian.trim() || !nominal) return
    setSubmitting(true)
    const tanggal = new Date().toISOString().split('T')[0]
    await addKebutuhan({ tanggal, rincian: rincian.trim(), nominal: Number(nominal.replace(/\./g, '')) })
    setRincian('')
    setNominal('')
    setSubmitting(false)
  }

  const openDetail = (item: KebutuhanItem) => {
    setSelected(item)
    setEditMode(false)
  }

  const openEdit = () => {
    if (!selected) return
    setEditRincian(selected.rincian)
    setEditNominal(String(selected.nominal))
    setEditMode(true)
  }

  const saveEdit = async () => {
    if (!selected || !editRincian.trim() || !editNominal) return
    await editKebutuhan({ ...selected, rincian: editRincian.trim(), nominal: Number(editNominal.replace(/\./g, '')) })
    setSelected((prev) => prev ? { ...prev, rincian: editRincian.trim(), nominal: Number(editNominal.replace(/\./g, '')) } : null)
    setEditMode(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteKebutuhan(selected.id)
    setSelected(null)
    setEditMode(false)
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
                state.kebutuhanList.map((k) => (
                  <tr
                    key={k.id}
                    onClick={() => openDetail(k)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                  >
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{k.rincian}</td>
                    <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-gray-200">
                      Rp {k.nominal.toLocaleString('id-ID')}
                    </td>
                  </tr>
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

      <Modal
        open={!!selected}
        onClose={() => { setSelected(null); setEditMode(false) }}
        title={editMode ? 'Edit Kebutuhan' : 'Detail Kebutuhan'}
      >
        {selected && !editMode && (
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Rincian</span>
              <p className="text-gray-900 font-medium dark:text-gray-100">{selected.rincian}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Nominal</span>
              <p className="text-gray-900 font-medium dark:text-gray-100">Rp {selected.nominal.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={openEdit} className="btn-primary flex-1 gap-2">
                <Pencil className="w-4 h-4" /> Edit Data
              </button>
              <button onClick={handleDelete} className="btn flex-1 gap-2 bg-red-600 text-white hover:bg-red-700 h-10 px-4 rounded-md dark:bg-red-700 dark:hover:bg-red-800">
                <Trash2 className="w-4 h-4" /> Hapus Data
              </button>
            </div>
          </div>
        )}
        {selected && editMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Rincian</label>
              <input
                type="text"
                value={editRincian}
                onChange={(e) => setEditRincian(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nominal</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp.</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editNominal}
                  onChange={(e) => setEditNominal(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                  className="input pl-11"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveEdit} className="btn-primary flex-1">
                Simpan
              </button>
              <button onClick={() => setEditMode(false)} className="btn-secondary flex-1">
                Batal
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Kebutuhan
