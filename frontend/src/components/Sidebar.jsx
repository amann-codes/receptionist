import React from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────
const PhoneIcon     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
const AlertIcon     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
const BriefcaseIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9-2h2v2h-2V5zm9 14H4V9h16v10z"/></svg>
const PersonIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
const SpamIcon      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/></svg>
const InboxIcon     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.45 2s2.75-.81 3.45-2H19v3zm0-5h-4.99c0 1.1-.9 2-2.01 2s-2.01-.9-2.01-2H5V5h14v9z"/></svg>
const CheckIcon     = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
const BotIcon       = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 11H6V7h12v13zm-5-8h-2v-2h2v2zm-4 0H7v-2h2v2zm8 0h-2v-2h2v2z"/></svg>
const NumberIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
const LogoutIcon    = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>

const CALL_FILTERS = [
  { id: 'all',      label: 'All Calls',  Icon: PhoneIcon },
  { id: 'urgent',   label: 'Urgent',     Icon: AlertIcon },
  { id: 'work',     label: 'Work',       Icon: BriefcaseIcon },
  { id: 'personal', label: 'Personal',   Icon: PersonIcon },
  { id: 'spam',     label: 'Spam',       Icon: SpamIcon },
]

const STATUS_FILTERS = [
  { id: 'unread',   label: 'Unread',   Icon: InboxIcon },
  { id: 'actioned', label: 'Actioned', Icon: CheckIcon },
]

export default function Sidebar({ page, filter, unreadCount, onSelectFilter, onNavigate, user, isDemo, onLogout }) {
  const isCallsPage = page === 'calls'

  return (
    <aside className="w-[220px] shrink-0 bg-surface border-r border-border flex flex-col sticky top-0 h-screen">

      {/* Logo + user */}
      <div className="px-5 pt-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0 shadow-md shadow-accent/20">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold tracking-tight truncate">Receptionist</div>
            <div className="text-[10px] text-tx-3 truncate">{user?.name || user?.username}</div>
          </div>
        </div>

        {/* Demo badge */}
        {isDemo && (
          <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-brand-amber
            bg-brand-amber-dim border border-brand-amber/20 rounded-[6px] px-2.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-amber inline-block" />
            Demo mode
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5">

        {/* Top-level pages */}
        <NavItem id="calls"  label="Calls"     Icon={PhoneIcon}  active={page === 'calls'}  onClick={() => onNavigate('calls')}  badge={unreadCount > 0 ? unreadCount : null} />
        <NavItem id="agent"  label="My Agent"  Icon={BotIcon}    active={page === 'agent'}  onClick={() => onNavigate('agent')} />
        <NavItem id="number" label="My Number" Icon={NumberIcon} active={page === 'number'} onClick={() => onNavigate('number')} />

        {/* Call sub-filters — only visible on calls page */}
        {isCallsPage && (
          <>
            <p className="text-[10px] font-semibold tracking-widest text-tx-3 uppercase px-2.5 pt-4 pb-1.5">
              Filter
            </p>
            {CALL_FILTERS.map(({ id, label, Icon }) => (
              <SubItem key={id} id={id} label={label} Icon={Icon}
                active={filter === id} onClick={() => onSelectFilter(id)}
              />
            ))}

            <p className="text-[10px] font-semibold tracking-widest text-tx-3 uppercase px-2.5 pt-4 pb-1.5">
              Status
            </p>
            {STATUS_FILTERS.map(({ id, label, Icon }) => (
              <SubItem key={id} id={id} label={label} Icon={Icon}
                active={filter === id} onClick={() => onSelectFilter(id)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-border shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px]
            text-tx-3 hover:text-brand-red hover:bg-brand-red-dim transition-all"
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function NavItem({ label, Icon, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13.5px] font-medium transition-all
        ${active
          ? 'bg-accent-dim text-accent'
          : 'text-tx-2 hover:bg-white/[0.04] hover:text-tx'
        }`}
    >
      <Icon />
      {label}
      {badge != null && (
        <span className="ml-auto text-[10px] font-bold bg-brand-red text-white rounded-full
          px-1.5 py-0.5 min-w-[18px] text-center leading-none">
          {badge}
        </span>
      )}
    </button>
  )
}

function SubItem({ label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-[12.5px] transition-all
        ${active
          ? 'text-accent bg-accent-dim'
          : 'text-tx-3 hover:bg-white/[0.03] hover:text-tx-2'
        }`}
    >
      <span className={`w-3.5 h-3.5 ${active ? 'text-accent' : 'text-tx-3'}`}><Icon /></span>
      {label}
    </button>
  )
}
