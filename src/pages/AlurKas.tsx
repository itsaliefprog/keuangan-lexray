import React, { useState } from 'react'
import { Plus, Pencil, Trash2, X, ArrowUpRight, ArrowDownRight, Repeat, Printer } from 'lucide-react'
import { useFinance } from '../store/FinanceContext'
import { supabase } from '../supabaseClient'
import type { AlurKasItem } from '../types'

function formatRp(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function formatDateId(date: Date): string {
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function toDatetimeLocalValue(date: Date): string {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const AlurKas: React.FC = () => {
  const { state, addAlurKas, deleteAlurKas, loadAlurKas } = useFinance()
  const [rincian, setRincian] = useState('')
  const [jenis, setJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [nominal, setNominal] = useState('')
  const [waktu, setWaktu] = useState(() => toDatetimeLocalValue(new Date()))
  const [submitting, setSubmitting] = useState(false)

  // filter
  const [filterMulai, setFilterMulai] = useState('')
  const [filterSampai, setFilterSampai] = useState('')

  const [activeRowId, setActiveRowId] = useState<string | null>(null)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AlurKasItem | null>(null)
  const [modalRincian, setModalRincian] = useState('')
  const [modalJenis, setModalJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan')
  const [modalNominal, setModalNominal] = useState('')
  const [modalWaktu, setModalWaktu] = useState('')
  const [modalSubmitting, setModalSubmitting] = useState(false)

  const openEditModal = (item: AlurKasItem) => {
    setEditingItem(item)
    setModalRincian(item.rincian)
    setModalJenis(item.jenis)
    setModalNominal(String(item.nominal))
    setModalWaktu(item.created_at ? toDatetimeLocalValue(new Date(item.created_at)) : toDatetimeLocalValue(new Date()))
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingItem(null)
    setModalRincian('')
    setModalJenis('pemasukan')
    setModalNominal('')
    setModalWaktu('')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !modalRincian.trim() || !modalNominal) return
    setModalSubmitting(true)

    const parsedNominal = Number(modalNominal.replace(/\./g, ''))

    const { error } = await supabase
      .from('alur_kas')
      .update({
        rincian: modalRincian.trim(),
        jenis: modalJenis,
        nominal: parsedNominal,
        created_at: new Date(modalWaktu).toISOString(),
      })
      .eq('id', editingItem.id)

    if (error) {
      console.log('Error Update:', error)
      setModalSubmitting(false)
      return
    }

    await loadAlurKas()
    setModalSubmitting(false)
    closeEditModal()
  }

  const handleDeleteRow = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus catatan keuangan ini? Tindakan ini akan mempengaruhi perhitungan total saldo.')) return
    await deleteAlurKas(id)
    await loadAlurKas()
    setActiveRowId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rincian.trim() || !nominal) return
    setSubmitting(true)

    const parsedNominal = Number(nominal.replace(/\./g, ''))

    await addAlurKas({
      rincian: rincian.trim(),
      jenis,
      nominal: parsedNominal,
      created_at: new Date(waktu).toISOString(),
    })
    setRincian('')
    setNominal('')
    setSubmitting(false)
  }

  // Filter data by date range (menggunakan created_at)
  const filteredList = state.alurKasList.filter((a) => {
    if (filterMulai && a.created_at && a.created_at.slice(0, 10) < filterMulai) return false
    if (filterSampai && a.created_at && a.created_at.slice(0, 10) > filterSampai) return false
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

  // Periode data untuk cetak laporan
  let periodeAwal = ''
  let periodeAkhir = ''
  if (filteredList.length > 0) {
    const dates = filteredList.filter(a => a.created_at).map(a => new Date(a.created_at!))
    if (dates.length > 0) {
      const minTime = Math.min(...dates.map(d => d.getTime()))
      const maxTime = Math.max(...dates.map(d => d.getTime()))
      periodeAwal = formatDateId(new Date(minTime))
      periodeAkhir = formatDateId(new Date(maxTime))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="print-area">
        {/* Watermark - hanya tampil saat cetak */}
        <div className="hidden print:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none z-0">
          <img src="/lexlogo.png" alt="Watermark" className="w-[550px] h-auto object-contain" />
        </div>

        {/* Kop Laporan - hanya tampil saat cetak */}
        <div className="print-only text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lexray Mitra Abadi</h1>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
          <Repeat className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          Alur Kas
        </h2>

        {periodeAwal && periodeAkhir && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
            Periode: {periodeAwal} s/d {periodeAkhir}
          </p>
        )}

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Waktu Transaksi</label>
            <input
              type="datetime-local"
              value={waktu}
              onChange={(e) => setWaktu(e.target.value)}
              className="input"
              required
            />
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
        <div className="card relative z-10">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-200">
            {filterMulai || filterSampai
              ? `Riwayat Alur Kas (${filterMulai || '...'} s/d ${filterSampai || '...'})`
              : 'Riwayat Alur Kas'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="hidden print:table-row print-spacer"><td colSpan={5}></td></tr>
                <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Waktu</th>
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
                    <React.Fragment key={a.id}>
                      <tr
                        onClick={() => setActiveRowId(activeRowId === a.id ? null : a.id)}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors dark:border-zinc-800 dark:hover:bg-zinc-800/30 ${
                          activeRowId === a.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="leading-tight">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                              {a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {a.created_at ? new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' WIB' : ''}
                            </div>
                          </div>
                        </td>
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
                      {activeRowId === a.id && (
                        <tr className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
                          <td colSpan={5} className="py-2 px-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => openEditModal(a)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(a.id)}
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
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeEditModal} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Alur Kas</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Jenis</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalJenis('pemasukan')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        modalJenis === 'pemasukan'
                          ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                          : 'border-gray-300 text-gray-600 dark:border-zinc-600 dark:text-gray-400'
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalJenis('pengeluaran')}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        modalJenis === 'pengeluaran'
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
                      value={modalNominal}
                      onChange={(e) => setModalNominal(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
                      className="input pl-11"
                      required
                    />
                  </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Waktu Transaksi</label>
                    <input
                      type="datetime-local"
                      value={modalWaktu}
                      onChange={(e) => setModalWaktu(e.target.value)}
                      className="input"
                      required
                    />
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

        {/* Page counter - hanya tampil saat cetak */}
        <div className="hidden print:block fixed bottom-4 right-6 text-xs text-gray-400 font-sans page-number-print" />
      </div>
    </div>
  )
}

export default AlurKas
