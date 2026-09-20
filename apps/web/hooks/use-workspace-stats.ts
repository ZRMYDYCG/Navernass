'use client'

import type { WorkspaceStats } from '@/lib/supabase/sdk/types'
import { useEffect, useReducer } from 'react'
import { workspaceApi } from '@/lib/supabase/sdk/workspace'

interface State {
  data: WorkspaceStats | null
  isLoading: boolean
  error: string | null
}

type Action
  = | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS', payload: WorkspaceStats }
    | { type: 'FETCH_ERROR', payload: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null }
    case 'FETCH_SUCCESS':
      return { data: action.payload, isLoading: false, error: null }
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload }
    default:
      return state
  }
}

interface UseWorkspaceStatsResult extends State {
  refetch: () => void
}

export function useWorkspaceStats(): UseWorkspaceStatsResult {
  const [state, dispatch] = useReducer(reducer, { data: null, isLoading: true, error: null })
  const [tick, refetchDispatch] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'FETCH_START' })

    workspaceApi
      .getStats()
      .then((stats) => {
        if (!cancelled) dispatch({ type: 'FETCH_SUCCESS', payload: stats })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'FETCH_ERROR', payload: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { ...state, refetch: refetchDispatch }
}
