import React, { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) { setError('Fill in all fields'); return }
    setLoading(true)
    setError('')
    try {
      await onLogin(username, password)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => { setUsername('demo'); setPassword('demo123'); setError('') }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">

      {/* subtle grid bg */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="w-full max-w-[360px] animate-fadeIn relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-[20px] font-semibold tracking-tight">Receptionist</div>
            <div className="text-[12px] text-tx-3 mt-0.5">Your AI-powered phone assistant</div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-[16px] p-7 shadow-xl shadow-black/30">
          <h1 className="text-[16px] font-semibold mb-5">Sign in to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-tx-3 uppercase tracking-widest block mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full bg-surface-2 border border-border focus:border-accent rounded-[8px]
                  text-[13.5px] text-tx px-3.5 py-2.5 focus:outline-none transition-colors
                  placeholder:text-tx-3"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-tx-3 uppercase tracking-widest block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-surface-2 border border-border focus:border-accent rounded-[8px]
                  text-[13.5px] text-tx px-3.5 py-2.5 focus:outline-none transition-colors
                  placeholder:text-tx-3"
              />
            </div>

            {error && (
              <div className="text-[12px] text-brand-red bg-brand-red-dim border border-brand-red/20
                rounded-[8px] px-3.5 py-2.5 animate-fadeIn flex items-center gap-2">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:opacity-90 disabled:opacity-50 text-white
                text-[14px] font-semibold py-2.5 rounded-[8px] transition-opacity mt-1
                shadow-lg shadow-accent/20"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-surface border border-border rounded-[12px] px-4 py-3
          flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium text-tx-2">Try the demo</p>
            <p className="text-[11px] text-tx-3 mt-0.5">
              <span className="font-mono bg-surface-2 px-1.5 py-0.5 rounded text-tx-2">demo</span>
              {' '}·{' '}
              <span className="font-mono bg-surface-2 px-1.5 py-0.5 rounded text-tx-2">demo123</span>
            </p>
          </div>
          <button
            onClick={fillDemo}
            className="text-[12px] font-medium text-accent border border-accent/30
              hover:bg-accent-dim px-3 py-1.5 rounded-[6px] transition-colors shrink-0"
          >
            Fill in
          </button>
        </div>
      </div>
    </div>
  )
}
