import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Send } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import { supabase } from '../supabaseClient'
import Modal from '../components/Modal'
import type { UangDiluarItem } from '../types'

const LAST_DATE_KEY = 'lastUangDiluarDate'

const UangDiluar: React.FC = () => {
  const { state, addUangDiluar, deleteUangDiluar, loadUangDiluar } = useFinance()
  const [tanggal, setTanggal] = useState(() => localStorage.getItem(LAST_DATE_KEY) || new Date().toISOString().split('T')[0])
  const [keterangan, setKeterangan] = useState('')
  const [nominal, setNominal] = useState('')

  const [selected, setSelected] = useState<UangDiluarItem | null>(null)
  const [editingItem, setEditingItem] = useState<UangDiluarItem | null>(null)

  const handleEdit = (item: UangDiluarItem) => {
    setEditingItem(item)
    setTanggal(item.tanggal)
    setKeterangan(item.keterangan)
    setNominal(String(item.nominal))
    setSelected(null)
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setTanggal(localStorage.getItem(LAST_DATE_KEY) || new Date().toISOString().split('T')[0])
    setKeterangan('')
    setNominal('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal || !keterangan.trim() || !nominal) return

    const parsedNominal = Number(nominal.replace(/\./g, ''))

    if (editingItem) {
      const { error } = await supabase
        .from('uang_di_luar')
        .update({
          tanggal,
          keterangan: keterangan.trim(),
          nominal: parsedNominal,
        })
        .eq('id', editingItem.id)

      if (error) {
        console.log('Error Update:', error)
        return
      }

      await loadUangDiluar()
      setEditingItem(null)
    } else {
      await addUangDiluar({ tanggal, keterangan: keterangan.trim(), nominal: parsedNominal })
      localStorage.setItem(LAST_DATE_KEY, tanggal)
    }

    setKeterangan('')
    setNominal('')
  }

  const openDetail = (item: UangDiluarItem) => {
    setSelected(item)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteUangDiluar(selected.id)
    await loadUangDiluar()
    setSelected(null)
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
        <div className="flex gap-2">
          <button type="submit" className="btn-primary gap-2">
            {editingItem ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingItem ? 'Simpan Perubahan' : 'Tambah Uang di Luar'}
          </button>
          {editingItem && (
            <button type="button" onClick={cancelEdit} className="btn-secondary">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal</th>
                <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Keterangan</th>
                <th className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nominal</th>
                <th className="py-3 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {state.uangDiluarList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    Belum ada data uang di luar.
                  </td>
                </tr>
              ) : (
                [...state.uangDiluarList].reverse().map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openDetail(u)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                  >
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{u.tanggal}</td>
                    <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{u.keterangan}</td>
                    <td className="py-3 px-3 text-right font-medium text-gray-900 dark:text-gray-200">
                      Rp {u.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit(u) }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 dark:border-zinc-700">
                <td colSpan={2} className="py-3 px-3 text-sm font-semibold text-gray-900 dark:text-gray-200">Total Uang di Luar</td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {totalUangDiluar.toLocaleString('id-ID')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => { setSelected(null) }}
        title="Detail Uang di Luar"
      >
        {selected && (
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Tanggal</span>
              <p className="text-gray-900 font-medium dark:text-gray-100">{selected.tanggal}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Keterangan</span>
              <p className="text-gray-900 font-medium dark:text-gray-100">{selected.keterangan}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Nominal</span>
              <p className="text-gray-900 font-medium dark:text-gray-100">Rp {selected.nominal.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { handleEdit(selected); setSelected(null) }} className="btn-primary flex-1 gap-2">
                <Pencil className="w-4 h-4" /> Edit Data
              </button>
              <button onClick={handleDelete} className="btn flex-1 gap-2 bg-red-600 text-white hover:bg-red-700 h-10 px-4 rounded-md dark:bg-red-700 dark:hover:bg-red-800">
                <Trash2 className="w-4 h-4" /> Hapus Data
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UangDiluar
