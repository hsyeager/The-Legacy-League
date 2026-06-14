const TABS = [
  { key: "standings", label: "Standings",      icon: "📊" },
  { key: "points",    label: "Results by Nation", icon: "⚽" },
  { key: "tournament", label: "Tournament",    icon: "🏆" },
  { key: "gamelog",  label: "Game Log",        icon: "📅" },
  { key: "teams",     label: "Teams",          icon: "👥" },
  { key: "rules",     label: "Rules",          icon: "📋" },
];

function App() {
  const [tab, setTab] = useState("standings");
  const [selected, setSelected] = useState(null);
  const [api, setApi] = useState({});          // ESPN-derived per-team results
  const [schedule, setSchedule] = useState([]); // full match list
  const [loaded, setLoaded] = useState(false);
  const [sync, setSync] = useState({ status: "idle", at: null, msg: "" });
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  // Load saved state
  useEffect(() => {
    loadData().then((d) => {
      if (d) {
        setApi(d.api || {});
        setSchedule(d.schedule || []);
        if (d.lastSync) setSync({ status: "idle", at: d.lastSync, msg: "" });
      }
      setLoaded(true);
    });
  }, []);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist
  useEffect(() => {
    if (loaded) saveData({ api, schedule, lastSync: sync.at });
  }, [api, schedule, sync.at, loaded]);

  const doSync = React.useCallback(async () => {
    setSync((s) => ({ ...s, status: "loading" }));
    try {
      const data = await syncFromESPN();
      setApi(data.teams);
      setSchedule(data.schedule);
      setSync({ status: "ok", at: Date.now(), msg: "" });
    } catch (e) {
      setSync((s) => ({ status: "error", at: s.at, msg: String(e.message || e) }));
    }
  }, []);

  // Auto-sync on load + every 5 minutes
  useEffect(() => {
    if (!loaded) return;
    doSync();
    const id = setInterval(doSync, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loaded, doSync]);

  // Responsive layout values
  const isMobile = width < 481;
  const isTablet = width >= 481 && width < 769;
  const isDesktop = width >= 769;
  const containerWidth = isMobile ? "100%" : isTablet ? "95%" : Math.min(560, width - 40);
  const padding = isMobile ? 8 : isTablet ? 16 : 20;
  const headerSize = isMobile ? 22 : isTablet ? 26 : 30;
  const tabCols = isMobile ? 3 : isTablet ? 4 : 6;
  const gap = isMobile ? 6 : isTablet ? 10 : 12;

  const results = useMemo(() => {
    const out = {};
    Object.keys(TEAMS).forEach((c) => { out[c] = api[c] || blankResult(); });
    return out;
  }, [api]);

  const syncColor = { idle: C.mut, loading: C.mut, ok: "#3f9c5b", error: "#c2547f" }[sync.status];
  const syncText = sync.status === "loading" ? "Syncing from ESPN…"
    : sync.status === "error" ? "Couldn't reach ESPN — using saved data"
    : sync.at ? `Synced ${new Date(sync.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
    : "Not synced yet";

  return (
    <div style={{
      minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, ${C.bg2}, ${C.bg})`,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text,
    }}>
      <div style={{ maxWidth: containerWidth, margin: "0 auto", padding: `${padding}px ${padding}px ${padding + 40}px`, transition: "all 0.3s ease" }}>
        {/* Header */}
        <div style={{ textAlign: "center", paddingBottom: padding, borderBottom: `1px solid ${C.gold}55`, marginBottom: padding }}>
          <div style={{ fontSize: isMobile ? 20 : isTablet ? 22 : 24, letterSpacing: 3 }}>🏆 🌍 ⚽</div>
          <h1 style={{
            color: C.gold, margin: `${padding / 2}px 0 4px`, fontSize: headerSize, fontWeight: 900, letterSpacing: isMobile ? 1 : 2,
          }}>THE LEGACY LEAGUE</h1>
          <div style={{ color: C.mut, fontSize: isMobile ? 10 : 11, letterSpacing: 2, fontWeight: 600 }}>
            WORLD CUP 2026 · FANTASY FOOTBALL DRAFT
          </div>
        </div>

        {/* Sync bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: padding / 2, marginBottom: padding,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: `${padding / 2}px ${padding / 1.5}px`,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: syncColor, flexShrink: 0 }} />
          <span style={{ flex: 1, color: C.mut, fontSize: isMobile ? 11.5 : 12.5, minWidth: isMobile ? "100%" : "auto" }}>{syncText}</span>
          <button onClick={doSync} disabled={sync.status === "loading"} style={{
            background: "transparent", border: `1px solid ${C.gold}66`, color: C.goldBright,
            borderRadius: 8, padding: `${padding / 2.5}px ${padding / 1.5}px`, fontSize: isMobile ? 11.5 : 12.5, fontWeight: 700,
            cursor: sync.status === "loading" ? "default" : "pointer", opacity: sync.status === "loading" ? 0.5 : 1, whiteSpace: "nowrap",
          }}>Sync now</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tabCols}, 1fr)`, gap: Math.max(2, gap / 3), marginBottom: padding + 4 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: active ? C.cardHi : "transparent",
                border: "none", borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
                borderRadius: 8, padding: `${padding / 1.5}px 2px`, cursor: "pointer",
                color: active ? C.gold : C.mut, fontWeight: active ? 800 : 600,
                fontSize: isMobile ? 10 : 11, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: isMobile ? 16 : 18 }}>{t.icon}</span>
                <span style={{ letterSpacing: 0.3, textTransform: "uppercase", textAlign: "center", lineHeight: 1.1, fontSize: isMobile ? 9 : 10 }}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === "rules" && <RulesTab />}
        {tab === "standings" && <StandingsTab results={results} />}
        {tab === "tournament" && <TournamentTab api={api} schedule={schedule} />}
        {tab === "teams" && <TeamsTab api={api} results={results} onSelect={setSelected} />}
        {tab === "points" && <PointsTab results={results} api={api} onSelect={setSelected} />}
        {tab === "gamelog" && <GameLogTab schedule={schedule} />}
      </div>

      <TeamDetail code={selected} api={api} results={results} onClose={() => setSelected(null)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
