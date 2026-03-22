import React, { useState } from 'react'

export default function APIBar({ apiBase, connected, connText, isDemo, onConnect, onDemo }) {
  const [url, setUrl] = useState(apiBase)

  return (
    <div className="px-6 py-2 bg-surface border-b border-border
      flex items-center gap-3 text-[12px] text-tx-2 flex-wrap shrink-0">

      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors
          ${connected
            ? 'bg-brand-green shadow-[0_0_6px_#22c55e] animate-pulse'
            : isDemo ? 'bg-brand-amber' : 'bg-tx-3'
          }`}
        />
        <span className={`shrink-0 text-[11.5px]
          ${connected ? 'text-brand-green' : isDemo ? 'text-brand-amber' : 'text-tx-3'}`}>
          {connText}
        </span>
        {isDemo && (
          <span className="text-[10px] font-semibold uppercase tracking-wider
            bg-brand-amber-dim text-brand-amber px-1.5 py-0.5 rounded-full">
            Demo
          </span>
        )}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onConnect(url)}
        className="bg-black/30 border border-border rounded-sm text-tx font-mono text-[11px]
          px-2.5 py-1 w-52 focus:outline-none focus:border-accent transition-colors"
        placeholder="http://localhost:8000"
      />
      <button
        onClick={() => onConnect(url)}
        className="bg-accent hover:opacity-85 text-white text-[11.5px] font-medium
          px-3 py-1 rounded-sm transition-opacity shrink-0"
      >
        Connect
      </button>
      <button
        onClick={onDemo}
        className="border border-border-2 text-tx-3 hover:text-tx hover:border-white/20
          text-[11.5px] px-3 py-1 rounded-sm transition-colors shrink-0"
      >
        Load demo
      </button>

      <span className="ml-auto text-[10.5px] text-tx-3 shrink-0 hidden md:block">
        Press <kbd className="font-mono bg-surface-2 border border-border px-1 rounded text-[10px]">Esc</kbd> to close panel
      </span>
    </div>
  )
}
