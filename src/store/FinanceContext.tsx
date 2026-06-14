import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import type { FinanceState, FinanceAction, KebutuhanItem, AlurKasItem, UangDiluarItem } from '../types'

const initialState: FinanceState = {
  kebutuhanList: [],
  alurKasList: [],
  uangDiluarList: [],
  loading: true,
}

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_KEBUTUHAN':
      return { ...state, kebutuhanList: action.payload, loading: false }
    case 'ADD_KEBUTUHAN':
      return { ...state, kebutuhanList: [action.payload, ...state.kebutuhanList] }
    case 'EDIT_KEBUTUHAN':
      return {
        ...state,
        kebutuhanList: state.kebutuhanList.map((k) =>
          k.id === action.payload.id ? action.payload : k
        ),
      }
    case 'DELETE_KEBUTUHAN':
      return { ...state, kebutuhanList: state.kebutuhanList.filter((k) => k.id !== action.payload) }
    case 'DELETE_ALL_KEBUTUHAN':
      return { ...state, kebutuhanList: [] }
    case 'SET_ALUR_KAS':
      return { ...state, alurKasList: action.payload, loading: false }
    case 'ADD_ALUR_KAS':
      return { ...state, alurKasList: [action.payload, ...state.alurKasList] }
    case 'EDIT_ALUR_KAS':
      return {
        ...state,
        alurKasList: state.alurKasList.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      }
    case 'DELETE_ALUR_KAS':
      return { ...state, alurKasList: state.alurKasList.filter((a) => a.id !== action.payload) }
    case 'SET_UANG_DILUAR':
      return { ...state, uangDiluarList: action.payload, loading: false }
    case 'ADD_UANG_DILUAR':
      return { ...state, uangDiluarList: [action.payload, ...state.uangDiluarList] }
    case 'EDIT_UANG_DILUAR':
      return {
        ...state,
        uangDiluarList: state.uangDiluarList.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      }
    case 'DELETE_UANG_DILUAR':
      return { ...state, uangDiluarList: state.uangDiluarList.filter((u) => u.id !== action.payload) }
    default:
      return state
  }
}

interface FinanceContextType {
  state: FinanceState
  loadKebutuhan: () => Promise<void>
  loadAlurKas: () => Promise<void>
  loadUangDiluar: () => Promise<void>
  addKebutuhan: (item: Omit<KebutuhanItem, 'id'>) => Promise<void>
  editKebutuhan: (item: KebutuhanItem) => Promise<void>
  deleteKebutuhan: (id: string) => Promise<void>
  deleteAllKebutuhan: () => Promise<void>
  addAlurKas: (item: Omit<AlurKasItem, 'id'>) => Promise<void>
  editAlurKas: (item: AlurKasItem) => Promise<void>
  deleteAlurKas: (id: string) => Promise<void>
  addUangDiluar: (item: Omit<UangDiluarItem, 'id'>) => Promise<void>
  editUangDiluar: (item: UangDiluarItem) => Promise<void>
  deleteUangDiluar: (id: string) => Promise<void>
}

const FinanceContext = createContext<FinanceContextType | null>(null)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState)

  const loadKebutuhan = useCallback(async () => {
    const { data, error } = await supabase
      .from('kebutuhan')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Gagal memuat kebutuhan:', error.message)
      dispatch({ type: 'SET_KEBUTUHAN', payload: [] })
      return
    }
    dispatch({ type: 'SET_KEBUTUHAN', payload: data ?? [] })
  }, [])

  const loadAlurKas = useCallback(async () => {
    const { data, error } = await supabase
      .from('alur_kas')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Gagal memuat alur kas:', error.message)
      dispatch({ type: 'SET_ALUR_KAS', payload: [] })
      return
    }
    dispatch({ type: 'SET_ALUR_KAS', payload: data ?? [] })
  }, [])

  const loadUangDiluar = useCallback(async () => {
    const { data, error } = await supabase
      .from('uang_di_luar')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Gagal memuat uang di luar:', error.message)
      dispatch({ type: 'SET_UANG_DILUAR', payload: [] })
      return
    }
    dispatch({ type: 'SET_UANG_DILUAR', payload: data ?? [] })
  }, [])

  useEffect(() => {
    Promise.all([loadKebutuhan(), loadAlurKas(), loadUangDiluar()])
  }, [loadKebutuhan, loadAlurKas, loadUangDiluar])

  const addKebutuhan = useCallback(async (item: Omit<KebutuhanItem, 'id' | 'created_at'>) => {
    const newItem: KebutuhanItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const { error } = await supabase.from('kebutuhan').insert(newItem)
    if (error) {
      console.error('Gagal menambah kebutuhan:', error.message)
      return
    }
    dispatch({ type: 'ADD_KEBUTUHAN', payload: newItem })
  }, [])

  const editKebutuhan = useCallback(async (item: KebutuhanItem) => {
    const { error } = await supabase.from('kebutuhan').update(item).eq('id', item.id)
    if (error) {
      console.error('Gagal mengedit kebutuhan:', error.message)
      return
    }
    dispatch({ type: 'EDIT_KEBUTUHAN', payload: item })
  }, [])

  const deleteKebutuhan = useCallback(async (id: string) => {
    const { error } = await supabase.from('kebutuhan').delete().eq('id', id)
    if (error) {
      console.error('Gagal menghapus kebutuhan:', error.message)
      return
    }
    dispatch({ type: 'DELETE_KEBUTUHAN', payload: id })
  }, [])

  const deleteAllKebutuhan = useCallback(async () => {
    const { error } = await supabase.from('kebutuhan').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) {
      console.error('Gagal menghapus semua kebutuhan:', error.message)
      return
    }
    dispatch({ type: 'DELETE_ALL_KEBUTUHAN' })
  }, [])

  const addAlurKas = useCallback(async (item: Omit<AlurKasItem, 'id' | 'created_at'>) => {
    const newItem: AlurKasItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const { error } = await supabase.from('alur_kas').insert(newItem)
    if (error) {
      console.error('Gagal menambah alur kas:', error.message)
      return
    }
    dispatch({ type: 'ADD_ALUR_KAS', payload: newItem })
  }, [])

  const editAlurKas = useCallback(async (item: AlurKasItem) => {
    const { error } = await supabase.from('alur_kas').update(item).eq('id', item.id)
    if (error) {
      console.error('Gagal mengedit alur kas:', error.message)
      return
    }
    dispatch({ type: 'EDIT_ALUR_KAS', payload: item })
  }, [])

  const deleteAlurKas = useCallback(async (id: string) => {
    const { error } = await supabase.from('alur_kas').delete().eq('id', id)
    if (error) {
      console.error('Gagal menghapus alur kas:', error.message)
      return
    }
    dispatch({ type: 'DELETE_ALUR_KAS', payload: id })
  }, [])

  const addUangDiluar = useCallback(async (item: Omit<UangDiluarItem, 'id' | 'created_at'>) => {
    const newItem: UangDiluarItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const { error } = await supabase.from('uang_di_luar').insert(newItem)
    if (error) {
      console.error('Gagal menambah uang di luar:', error.message)
      return
    }
    dispatch({ type: 'ADD_UANG_DILUAR', payload: newItem })
  }, [])

  const editUangDiluar = useCallback(async (item: UangDiluarItem) => {
    const { error } = await supabase.from('uang_di_luar').update(item).eq('id', item.id)
    if (error) {
      console.error('Gagal mengedit uang di luar:', error.message)
      return
    }
    dispatch({ type: 'EDIT_UANG_DILUAR', payload: item })
  }, [])

  const deleteUangDiluar = useCallback(async (id: string) => {
    const { error } = await supabase.from('uang_di_luar').delete().eq('id', id)
    if (error) {
      console.error('Gagal menghapus uang di luar:', error.message)
      return
    }
    dispatch({ type: 'DELETE_UANG_DILUAR', payload: id })
  }, [])

  return (
    <FinanceContext.Provider
      value={{
        state,
        loadKebutuhan,
        loadAlurKas,
        loadUangDiluar,
        addKebutuhan,
        editKebutuhan,
        deleteKebutuhan,
        deleteAllKebutuhan,
        addAlurKas,
        editAlurKas,
        deleteAlurKas,
        addUangDiluar,
        editUangDiluar,
        deleteUangDiluar,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance(): FinanceContextType {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
