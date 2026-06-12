export interface KebutuhanItem {
  id: string
  rincian: string
  nominal: number
}

export interface AlurKasItem {
  id: string
  tanggal: string
  rincian: string
  jenis: 'pemasukan' | 'pengeluaran'
  nominal: number
}

export interface UangDiluarItem {
  id: string
  nama: string
  nominal: number
}

export interface FinanceState {
  kebutuhanList: KebutuhanItem[]
  alurKasList: AlurKasItem[]
  uangDiluarList: UangDiluarItem[]
}

export type FinanceAction =
  | { type: 'ADD_KEBUTUHAN'; payload: KebutuhanItem }
  | { type: 'EDIT_KEBUTUHAN'; payload: KebutuhanItem }
  | { type: 'DELETE_KEBUTUHAN'; payload: string }
  | { type: 'DELETE_ALL_KEBUTUHAN' }
  | { type: 'ADD_ALUR_KAS'; payload: AlurKasItem }
  | { type: 'EDIT_ALUR_KAS'; payload: AlurKasItem }
  | { type: 'DELETE_ALUR_KAS'; payload: string }
  | { type: 'ADD_UANG_DILUAR'; payload: UangDiluarItem }
  | { type: 'EDIT_UANG_DILUAR'; payload: UangDiluarItem }
  | { type: 'DELETE_UANG_DILUAR'; payload: string }
  | { type: 'SET_INITIAL'; payload: FinanceState }
