export interface KebutuhanItem {
  id: string
  tanggal: string
  rincian: string
  nominal: number
  created_at?: string
}

export interface AlurKasItem {
  id: string
  tanggal: string
  rincian: string
  jenis: 'pemasukan' | 'pengeluaran'
  nominal: number
  created_at?: string
}

export interface UangDiluarItem {
  id: string
  tanggal: string
  keterangan: string
  nominal: number
  created_at?: string
}

export interface FinanceState {
  kebutuhanList: KebutuhanItem[]
  alurKasList: AlurKasItem[]
  uangDiluarList: UangDiluarItem[]
  loading: boolean
}

export type FinanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_KEBUTUHAN'; payload: KebutuhanItem[] }
  | { type: 'ADD_KEBUTUHAN'; payload: KebutuhanItem }
  | { type: 'EDIT_KEBUTUHAN'; payload: KebutuhanItem }
  | { type: 'DELETE_KEBUTUHAN'; payload: string }
  | { type: 'DELETE_ALL_KEBUTUHAN' }
  | { type: 'SET_ALUR_KAS'; payload: AlurKasItem[] }
  | { type: 'ADD_ALUR_KAS'; payload: AlurKasItem }
  | { type: 'EDIT_ALUR_KAS'; payload: AlurKasItem }
  | { type: 'DELETE_ALUR_KAS'; payload: string }
  | { type: 'SET_UANG_DILUAR'; payload: UangDiluarItem[] }
  | { type: 'ADD_UANG_DILUAR'; payload: UangDiluarItem }
  | { type: 'EDIT_UANG_DILUAR'; payload: UangDiluarItem }
  | { type: 'DELETE_UANG_DILUAR'; payload: string }
