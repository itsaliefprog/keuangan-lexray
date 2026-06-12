import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { FinanceState, FinanceAction, KebutuhanItem, AlurKasItem, UangDiluarItem } from '../types'

const STORAGE_KEY = 'keuangan-kantor-state'

const initialState: FinanceState = {
  kebutuhanList: [],
  alurKasList: [],
  uangDiluarList: [],
}

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'ADD_KEBUTUHAN':
      return { ...state, kebutuhanList: [...state.kebutuhanList, action.payload] }
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
    case 'ADD_ALUR_KAS':
      return { ...state, alurKasList: [...state.alurKasList, action.payload] }
    case 'EDIT_ALUR_KAS':
      return {
        ...state,
        alurKasList: state.alurKasList.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      }
    case 'DELETE_ALUR_KAS':
      return { ...state, alurKasList: state.alurKasList.filter((a) => a.id !== action.payload) }
    case 'ADD_UANG_DILUAR':
      return { ...state, uangDiluarList: [...state.uangDiluarList, action.payload] }
    case 'EDIT_UANG_DILUAR':
      return {
        ...state,
        uangDiluarList: state.uangDiluarList.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      }
    case 'DELETE_UANG_DILUAR':
      return { ...state, uangDiluarList: state.uangDiluarList.filter((u) => u.id !== action.payload) }
    case 'SET_INITIAL':
      return action.payload
    default:
      return state
  }
}

interface FinanceContextType {
  state: FinanceState
  addKebutuhan: (item: KebutuhanItem) => void
  editKebutuhan: (item: KebutuhanItem) => void
  deleteKebutuhan: (id: string) => void
  deleteAllKebutuhan: () => void
  addAlurKas: (item: AlurKasItem) => void
  editAlurKas: (item: AlurKasItem) => void
  deleteAlurKas: (id: string) => void
  addUangDiluar: (item: UangDiluarItem) => void
  editUangDiluar: (item: UangDiluarItem) => void
  deleteUangDiluar: (id: string) => void
}

const FinanceContext = createContext<FinanceContextType | null>(null)

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FinanceState
  } catch { /* ignore */ }
  return initialState
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, initialState, () => loadState())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addKebutuhan = useCallback((item: KebutuhanItem) => dispatch({ type: 'ADD_KEBUTUHAN', payload: item }), [])
  const editKebutuhan = useCallback((item: KebutuhanItem) => dispatch({ type: 'EDIT_KEBUTUHAN', payload: item }), [])
  const deleteKebutuhan = useCallback((id: string) => dispatch({ type: 'DELETE_KEBUTUHAN', payload: id }), [])
  const deleteAllKebutuhan = useCallback(() => dispatch({ type: 'DELETE_ALL_KEBUTUHAN' }), [])
  const addAlurKas = useCallback((item: AlurKasItem) => dispatch({ type: 'ADD_ALUR_KAS', payload: item }), [])
  const editAlurKas = useCallback((item: AlurKasItem) => dispatch({ type: 'EDIT_ALUR_KAS', payload: item }), [])
  const deleteAlurKas = useCallback((id: string) => dispatch({ type: 'DELETE_ALUR_KAS', payload: id }), [])
  const addUangDiluar = useCallback((item: UangDiluarItem) => dispatch({ type: 'ADD_UANG_DILUAR', payload: item }), [])
  const editUangDiluar = useCallback((item: UangDiluarItem) => dispatch({ type: 'EDIT_UANG_DILUAR', payload: item }), [])
  const deleteUangDiluar = useCallback((id: string) => dispatch({ type: 'DELETE_UANG_DILUAR', payload: id }), [])

  return (
    <FinanceContext.Provider
      value={{
        state,
        addKebutuhan, editKebutuhan, deleteKebutuhan, deleteAllKebutuhan,
        addAlurKas, editAlurKas, deleteAlurKas,
        addUangDiluar, editUangDiluar, deleteUangDiluar,
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
