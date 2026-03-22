import React, { createContext, useContext, useCallback, useReducer } from 'react'

const ToastCtx = createContext(null)

let _id = 0

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast]
    case 'REMOVE': return state.filter(t => t.id !== action.id)
    default:       return state
  }
}

const ICONS = {
  success: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 9h-2V7h2v4zm0 4h-2v-2h2v2z"/>
    </svg>
  ),
}

const STYLES = {
  success: 'bg-brand-green-dim border-brand-green/30 text-brand-green',
  error:   'bg-brand-red-dim border-brand-red/30 text-brand-red',
  info:    'bg-accent-dim border-accent/30 text-accent',
}

function Toast({ toast, onRemove }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border
        text-[13px] font-medium shadow-lg backdrop-blur-sm
        animate-slideUp max-w-[340px] w-full
        ${STYLES[toast.kind] || STYLES.info}`}
    >
      {ICONS[toast.kind] || ICONS.info}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-50 hover:opacity-100 transition-opacity ml-1 shrink-0"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
        </svg>
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, [])

  const remove = useCallback((id) => dispatch({ type: 'REMOVE', id }), [])

  const toast = useCallback((message, kind = 'info', duration = 3500) => {
    const id = ++_id
    dispatch({ type: 'ADD', toast: { id, message, kind } })
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* Portal-style fixed container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
