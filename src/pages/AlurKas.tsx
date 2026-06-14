import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Repeat, Printer } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import Modal from '../components/Modal'
import type { AlurKasItem } from '../types'

const LAST_DATE_KEY = 'lastAlurKasDate'

function formatRp(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID')
}

const AlurKas: React.FC = () => {
  const { state, addAlurKas, editAlurKas, deleteAlurKas, loadAlurKas } = useFinance()
  const [tanggal, setTanggal] = useState(() => localStorage.getItem(LAST_DATE_KEY) || '')
  const [rincian, setRincian] = useState('')
  const [jenis, setJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [nominal, setNominal] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // filter
  const [filterMulai, setFilterMulai] = useState('')
  const [filterSampai, setFilterSampai] = useState('')

  // modal
  const [selected, setSelected] = useState<AlurKasItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editTanggal, setEditTanggal] = useState('')
  const [editRincian, setEditRincian] = useState('')
  const [editJenis, setEditJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [editNominal, setEditNominal] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal || !rincian.trim() || !nominal) return
    setSubmitting(true)
    await addAlurKas({
      tanggal,
      rincian: rincian.trim(),
      jenis,
      nominal: Number(nominal.replace(/\./g, '')),
    })
    await loadAlurKas()
    localStorage.setItem(LAST_DATE_KEY, tanggal)
    setRincian('')
    setNominal('')
    setSubmitting(false)
  }

  const openDetail = (item: AlurKasItem) => {
    setSelected(item)
    setEditMode(false)
  }

  const openEdit = () => {
    if (!selected) return
    setEditTanggal(selected.tanggal)
    setEditRincian(selected.rincian)
    setEditJenis(selected.jenis)
    setEditNominal(String(selected.nominal))
    setEditMode(true)
  }

  const saveEdit = async () => {
    if (!selected || !editTanggal || !editRincian.trim() || !editNominal) return
    await editAlurKas({
      ...selected,
      tanggal: editTanggal,
      rincian: editRincian.trim(),
      jenis: editJenis,
      nominal: Number(editNominal.replace(/\./g, '')),
    })
    setSelected((prev) =>
      prev
        ? { ...prev, tanggal: editTanggal, rincian: editRincian.trim(), jenis: editJenis, nominal: Number(editNominal.replace(/\./g, '')) }
        : null
    )
    setEditMode(false)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteAlurKas(selected.id)
    await loadAlurKas()
    setSelected(null)
    setEditMode(false)
  }

  // Filter data by date range
  const filteredList = state.alurKasList.filter((a) => {
    if (filterMulai && a.tanggal < filterMulai) return false
    if (filterSampai && a.tanggal > filterSampai) return false
    return true
  })

  // 1. Hitung saldo berjalan kronologis (ASC = tertua → terbaru)
  let currentSaldo = 0
  const calculatedData = filteredList.map((item) => {
    if (item.jenis === 'pemasukan') {
      currentSaldo += Number(item.nominal)
    } else if (item.jenis === 'pengeluaran') {
      currentSaldo -= Number(item.nominal)
    }
    return { ...item, saldo_berjalan: currentSaldo }
  })

  // 2. Balik urutan untuk tabel UI (terbaru di atas)
  const displayList = [...calculatedData].reverse()

  // 3. Saldo akhir = akumulasi terakhir dari data kronologis
  const saldoAkhir = currentSaldo

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="print-area">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
          <Repeat className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          Alur Kas
        </h2>

        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Akhir</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatRp(saldoAkhir)}
            </span>
          </div>
        </div>

        {/* Form Input - hidden saat print */}
        <form onSubmit={handleSubmit} className="card space-y-4 print-hidden">
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
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Jenis</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJenis('pemasukan')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  jenis === 'pemasukan'
                    ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-400 dark:hover:bg-zinc-800'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => setJenis('pengeluaran')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  jenis === 'pengeluaran'
                    ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-400 dark:hover:bg-zinc-800'
                }`}
              >
                Pengeluaran
              </button>
            </div>
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
            {submitting ? 'Menyimpan...' : 'Tambah Pencatatan'}
          </button>
        </form>

        {/* Filter + Cetak - hidden saat print */}
        <div className="card space-y-4 print-hidden">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Filter Laporan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Mulai Tanggal</label>
              <input
                type="date"
                value={filterMulai}
                onChange={(e) => setFilterMulai(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Sampai Tanggal</label>
              <input
                type="date"
                value={filterSampai}
                onChange={(e) => setFilterSampai(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>

        {/* Tabel */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-200">
            {filterMulai || filterSampai
              ? `Riwayat Alur Kas (${filterMulai || '...'} s/d ${filterSampai || '...'})`
              : 'Riwayat Alur Kas'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rincian</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Jenis</th>
                  <th className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Nominal</th>
                  <th className="text-right py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      Belum ada pencatatan kas.
                    </td>
                  </tr>
                ) : (
                  displayList.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => openDetail(a)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                      >
                        <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{a.tanggal}</td>
                        <td className="py-3 px-3 text-gray-900 dark:text-gray-200">{a.rincian}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              a.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {a.jenis === 'pemasukan' ? (
                              <><ArrowUpRight className="w-3 h-3" /> Pemasukan</>
                            ) : (
                              <><ArrowDownRight className="w-3 h-3" /> Pengeluaran</>
                            )}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-3 text-right font-medium ${
                            a.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          Rp {a.nominal.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-gray-200">
                          Rp {(a.saldo_berjalan ?? 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal
          open={!!selected}
          onClose={() => { setSelected(null); setEditMode(false) }}
          title={editMode ? 'Edit Alur Kas' : 'Detail Alur Kas'}
        >
          {selected && !editMode && (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Tanggal</span>
                <p className="text-gray-900 font-medium dark:text-gray-100">{selected.tanggal}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Rincian</span>
                <p className="text-gray-900 font-medium dark:text-gray-100">{selected.rincian}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Jenis</span>
                <p className={`font-medium ${selected.jenis === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {selected.jenis === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Tanggal</label>
                <input type="date" value={editTanggal} onChange={(e) => setEditTanggal(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Rincian</label>
                <input type="text" value={editRincian} onChange={(e) => setEditRincian(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Jenis</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditJenis('pemasukan')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      editJenis === 'pemasukan'
                        ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                        : 'border-gray-300 text-gray-600 dark:border-zinc-600 dark:text-gray-400'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditJenis('pengeluaran')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      editJenis === 'pengeluaran'
                        ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
                        : 'border-gray-300 text-gray-600 dark:border-zinc-600 dark:text-gray-400'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
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
                <button onClick={saveEdit} className="btn-primary flex-1">Simpan</button>
                <button onClick={() => setEditMode(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default AlurKas
