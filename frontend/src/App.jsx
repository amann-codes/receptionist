import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import CallCard from "./components/CallCard";
import DetailPanel from "./components/DetailPanel";
import LoginScreen from "./components/LoginScreen";
// import AgentPage from "./components/AgentPage";
// import NumberPage from "./components/NumberPage";
import { StatCardSkeleton, CallCardSkeleton } from "./components/Skeletons";
import { DEMO_USER, DEMO_CALLS, DEMO_AGENT_CONFIG } from "./data";
import {
  getToken,
  clearToken,
  isDemoCredentials,
  login,
  verifyToken,
  fetchStats,
  fetchCalls,
  patchStatus,
  patchNotes,
  deleteCall,
  fetchAgentConfig,
  saveAgentConfig,
} from "./api";
import { useToast } from "./ToastContext";

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);
const WorkIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-9-2h2v2h-2V5zm9 14H4V9h16v10z" />
  </svg>
);

const FILTER_TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread", dot: "bg-accent" },
  { id: "urgent", label: "Urgent", dot: "bg-brand-red" },
  { id: "work", label: "Work", dot: "bg-brand-blue" },
  { id: "personal", label: "Personal", dot: "bg-brand-green" },
  { id: "spam", label: "Spam", dot: "bg-tx-3" },
];

export default function App() {
  const toast = useToast();

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null); // null = not logged in
  const [isDemo, setIsDemo] = useState(false);

  // ── Backend state ──────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState(null);
  const [calls, setCalls] = useState([]);
  const [agentConfig, setAgentConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [page, setPage] = useState("calls"); // calls | agent | number
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape" && selected) setSelected(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected]);

  // ── 401 listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const h = () => {
      setUser(null);
      toast("Session expired — please sign in again", "error");
    };
    window.addEventListener("receptionist:unauthorized", h);
    return () => window.removeEventListener("receptionist:unauthorized", h);
  }, [toast]);

  // ── On mount: restore session ──────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      // Check for demo session in sessionStorage
      const demoSession = sessionStorage.getItem("receptionist_demo");
      if (demoSession) {
        bootDemo();
        setAuthReady(true);
        return;
      }
      const token = getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await verifyToken();
        setUser({ username: me.username, name: me.username });
        await loadBackend();
      } catch {
        clearToken();
      } finally {
        setAuthReady(true);
      }
    };
    restore();
  }, []); // eslint-disable-line

  // ── Demo boot ──────────────────────────────────────────────────────────────
  const bootDemo = useCallback(() => {
    setIsDemo(true);
    setUser(DEMO_USER);
    setCalls(DEMO_CALLS);
    setAgentConfig(DEMO_AGENT_CONFIG);
    setStats({
      total: DEMO_CALLS.length,
      unread: DEMO_CALLS.filter((c) => c.status === "unread").length,
      urgent: DEMO_CALLS.filter((c) => c.intent === "urgent").length,
      by_intent: {
        work: DEMO_CALLS.filter((c) => c.intent === "work").length,
        personal: DEMO_CALLS.filter((c) => c.intent === "personal").length,
        urgent: DEMO_CALLS.filter((c) => c.intent === "urgent").length,
        spam: DEMO_CALLS.filter((c) => c.intent === "spam").length,
        other: DEMO_CALLS.filter((c) => c.intent === "other").length,
      },
      by_status: {
        unread: DEMO_CALLS.filter((c) => c.status === "unread").length,
        read: DEMO_CALLS.filter((c) => c.status === "read").length,
        actioned: DEMO_CALLS.filter((c) => c.status === "actioned").length,
      },
    });
    sessionStorage.setItem("receptionist_demo", "1");
  }, []);

  // ── Load from backend ──────────────────────────────────────────────────────
  const loadBackend = useCallback(async () => {
    setLoading(true);
    try {
      const [s, d, ag] = await Promise.all([
        fetchStats(),
        fetchCalls(),
        fetchAgentConfig().catch(() => DEMO_AGENT_CONFIG),
      ]);
      setStats(s);
      setCalls(d.calls || []);
      setAgentConfig(ag);
      setConnected(true);
    } catch (err) {
      if (err.message !== "Unauthorized") setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (username, password) => {
      // Demo bypass
      if (isDemoCredentials(username, password)) {
        bootDemo();
        return;
      }
      // Real auth
      await login(username, password);
      setIsDemo(false);
      const me = await verifyToken();
      setUser({ username: me.username, name: me.username });
      await loadBackend();
    },
    [bootDemo, loadBackend],
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    clearToken();
    sessionStorage.removeItem("receptionist_demo");
    setUser(null);
    setIsDemo(false);
    setConnected(false);
    setCalls([]);
    setStats(null);
    setAgentConfig(null);
    setSelected(null);
    setPage("calls");
  }, []);

  // ── Agent save ─────────────────────────────────────────────────────────────
  const handleSaveAgent = useCallback(
    async (cfg) => {
      if (isDemo) {
        setAgentConfig(cfg);
        return; // In demo, just update local state
      }
      const saved = await saveAgentConfig(cfg);
      setAgentConfig(saved);
    },
    [isDemo],
  );

  // ── Call actions ───────────────────────────────────────────────────────────
  const handleAction = useCallback(
    async (callId, status) => {
      setCalls((prev) =>
        prev.map((c) => (c.call_id === callId ? { ...c, status } : c)),
      );
      setSelected((s) => (s?.call_id === callId ? { ...s, status } : s));
      if (!isDemo) {
        try {
          await patchStatus(callId, status);
          const s = await fetchStats();
          setStats(s);
          if (status === "actioned") toast("Marked as actioned ✓", "success");
        } catch {
          toast("Failed to update status", "error");
        }
      } else {
        if (status === "actioned") toast("Marked as actioned ✓", "success");
      }
    },
    [isDemo, toast],
  );

  const handleNotes = useCallback(
    async (callId, notes) => {
      setCalls((prev) =>
        prev.map((c) => (c.call_id === callId ? { ...c, notes } : c)),
      );
      setSelected((s) => (s?.call_id === callId ? { ...s, notes } : s));
      if (!isDemo) {
        try {
          await patchNotes(callId, notes);
        } catch {
          toast("Failed to save note", "error");
        }
      }
    },
    [isDemo, toast],
  );

  const handleDelete = useCallback(
    async (callId) => {
      setCalls((prev) => prev.filter((c) => c.call_id !== callId));
      setSelected(null);
      toast("Call deleted", "success");
      if (!isDemo) {
        try {
          await deleteCall(callId);
          const s = await fetchStats();
          setStats(s);
        } catch {
          toast("Failed to delete call", "error");
        }
      }
    },
    [isDemo, toast],
  );

  const handleOpen = useCallback(
    (call) => {
      setSelected(call);
      if (call.status === "unread") handleAction(call.call_id, "read");
    },
    [handleAction],
  );

  const handleRefresh = useCallback(async () => {
    if (!isDemo) {
      await loadBackend();
      toast("Refreshed", "success");
    } else {
      toast("This is demo data", "info");
    }
  }, [isDemo, loadBackend, toast]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const liveStats = useMemo(
    () =>
      stats ?? {
        total: calls.length,
        unread: calls.filter((c) => c.status === "unread").length,
        urgent: calls.filter((c) => c.intent === "urgent").length,
        by_intent: { work: calls.filter((c) => c.intent === "work").length },
      },
    [stats, calls],
  );

  const unreadCount = calls.filter((c) => c.status === "unread").length;

  const filtered = useMemo(() => {
    let list = [...calls];
    if (["unread", "actioned", "read"].includes(filter))
      list = list.filter((c) => c.status === filter);
    else if (filter !== "all") list = list.filter((c) => c.intent === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.caller_name?.toLowerCase().includes(q) ||
          c.message?.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [calls, filter, search]);

  const pageTitle =
    {
      all: "All Calls",
      unread: "Unread",
      actioned: "Actioned",
      urgent: "Urgent",
      work: "Work",
      personal: "Personal",
      spam: "Spam",
    }[filter] || "All Calls";

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg
          className="w-5 h-5 text-tx-3 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        page={page}
        filter={filter}
        unreadCount={unreadCount}
        onSelectFilter={setFilter}
        onNavigate={(p) => {
          setPage(p);
          setSelected(null);
        }}
        user={user}
        isDemo={isDemo}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Page: Agent ── */}
        {page === "agent" && agentConfig && (
          <AgentPage
            agentConfig={agentConfig}
            onSave={handleSaveAgent}
            isDemo={isDemo}
          />
        )}

        {/* ── Page: Number ── */}
        {page === "number" && <NumberPage user={user} isDemo={isDemo} />}

        {/* ── Page: Calls ── */}
        {page === "calls" && (
          <>
            {/* Topbar */}
            <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-bg shrink-0">
              <div>
                <h1 className="text-[16px] font-semibold tracking-tight">
                  {pageTitle}
                </h1>
                <p className="text-[12px] text-tx-3 mt-0.5">
                  {loading
                    ? "Loading…"
                    : `${filtered.length} call${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="border border-border-2 text-tx-2 hover:text-tx hover:border-white/20
                  text-[13px] font-medium px-3 py-1.5 rounded-sm transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-7">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3.5 mb-7">
                {loading && !stats ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                  ))
                ) : (
                  <>
                    <StatCard
                      label="Total calls"
                      value={liveStats.total}
                      meta="All time"
                      icon={PhoneIcon}
                      iconClass="bg-accent-dim text-accent"
                    />
                    <StatCard
                      label="Unread"
                      value={liveStats.unread}
                      meta="Need attention"
                      icon={MailIcon}
                      iconClass="bg-brand-amber-dim text-brand-amber"
                    />
                    <StatCard
                      label="Urgent"
                      value={liveStats.urgent}
                      meta="High priority"
                      icon={AlertIcon}
                      iconClass="bg-brand-red-dim text-brand-red"
                    />
                    <StatCard
                      label="Work calls"
                      value={liveStats.by_intent?.work}
                      meta="Professional"
                      icon={WorkIcon}
                      iconClass="bg-brand-green-dim text-brand-green"
                    />
                  </>
                )}
              </div>

              {/* Filter tabs + search */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium
                      border transition-all
                      ${
                        filter === tab.id
                          ? "bg-accent text-white border-transparent"
                          : "border-border text-tx-2 hover:text-tx hover:border-border-2 bg-transparent"
                      }`}
                  >
                    {tab.dot && (
                      <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                    )}
                    {tab.label}
                  </button>
                ))}

                <div className="ml-auto relative">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-3 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search calls…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-surface border border-border rounded-sm text-[13px] text-tx
                      pl-8 pr-3 py-1.5 w-48 focus:outline-none focus:border-accent
                      placeholder:text-tx-3 transition-colors"
                  />
                </div>
              </div>

              {/* List */}
              {loading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <CallCardSkeleton key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  filter={filter}
                  search={search}
                  onClear={() => {
                    setFilter("all");
                    setSearch("");
                  }}
                />
              ) : (
                <div className="flex flex-col gap-2 animate-fadeIn">
                  {filtered.map((call) => (
                    <CallCard
                      key={call.call_id}
                      call={call}
                      onClick={handleOpen}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selected && (
        <DetailPanel
          call={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          onNotes={handleNotes}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function EmptyState({ filter, search, onClear }) {
  const hasSearch = search.trim().length > 0;
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-tx-3 animate-fadeIn">
      <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center">
        <svg
          className="w-6 h-6 opacity-30"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[14px] font-medium text-tx-2">
          {hasSearch
            ? `No results for "${search}"`
            : `No ${filter === "all" ? "" : filter + " "}calls`}
        </p>
        <p className="text-[12px] mt-1">
          {hasSearch
            ? "Try a different search term"
            : filter !== "all"
              ? "No calls in this category yet"
              : "Calls will appear here once your agent receives them"}
        </p>
      </div>
      {(hasSearch || filter !== "all") && (
        <button
          onClick={onClear}
          className="text-[12.5px] text-accent hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
