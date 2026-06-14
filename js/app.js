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

  const syncColor = { idle: C.mut, loading: C.mut, ok: C.win, error: C.red }[sync.status];
  const syncText = sync.status === "loading" ? "Syncing from ESPN…"
    : sync.status === "error" ? "Couldn't reach ESPN — using saved data"
    : sync.at ? `Synced ${new Date(sync.at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
    : "Not synced yet";

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(900px 500px at 12% -8%, rgba(212,175,55,0.10), transparent 60%), `
        + `radial-gradient(900px 500px at 88% -5%, rgba(63,214,138,0.07), transparent 60%), `
        + `radial-gradient(1200px 700px at 50% -10%, ${C.bg2}, ${C.bg} 60%)`,
      fontFamily: FONT_BODY, color: C.text,
    }}>
      <div style={{ maxWidth: containerWidth, margin: "0 auto", padding: `${padding}px ${padding}px ${padding + 40}px`, transition: "all 0.3s ease" }}>
        {/* Header */}
        <div style={{ textAlign: "center", paddingBottom: padding, marginBottom: padding }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: isMobile ? 50 : 58, height: isMobile ? 50 : 58, borderRadius: 16,
            background: C.goldGrad, boxShadow: SHADOW.gold,
            fontSize: isMobile ? 24 : 28, marginBottom: 10,
          }}>🏆</div>
          <h1 style={{
            fontFamily: FONT_DISPLAY, margin: 0, fontSize: headerSize, fontWeight: 600,
            letterSpacing: isMobile ? 2 : 4, textTransform: "uppercase", ...goldText,
          }}>The Legacy League</h1>
          <div style={{ color: C.mut, fontSize: isMobile ? 10 : 11, letterSpacing: 3, fontWeight: 600, textTransform: "uppercase", marginTop: 6 }}>
            World Cup 2026 · Fantasy Football Draft
          </div>
          <div style={{ height: 3, width: 90, margin: `${padding}px auto 0`, borderRadius: 2, background: C.goldGrad, boxShadow: SHADOW.gold }} />
        </div>

        {/* Sync bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: padding / 2, marginBottom: padding,
          background: C.cardGrad, border: `1px solid ${C.border}`, borderRadius: 12, padding: `${padding / 2}px ${padding / 1.5}px`,
          boxShadow: `${SHADOW.card}, ${SHADOW.inset}`,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 99, background: syncColor, flexShrink: 0,
            boxShadow: sync.status === "idle" ? "none" : `0 0 8px ${syncColor}`,
            animation: sync.status === "loading" ? "pulse 1.5s infinite" : "none",
          }} />
          <span style={{ flex: 1, color: C.mut, fontSize: isMobile ? 11.5 : 12.5, minWidth: isMobile ? "100%" : "auto" }}>{syncText}</span>
          <button onClick={doSync} disabled={sync.status === "loading"} style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.05))",
            border: `1px solid ${C.gold}66`, color: C.goldBright,
            borderRadius: 8, padding: `${padding / 2.5}px ${padding / 1.5}px`, fontSize: isMobile ? 11.5 : 12.5, fontWeight: 700,
            fontFamily: FONT_DISPLAY, letterSpacing: 0.5, textTransform: "uppercase",
            cursor: sync.status === "loading" ? "default" : "pointer", opacity: sync.status === "loading" ? 0.5 : 1, whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>Sync now</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${tabCols}, 1fr)`, gap: Math.max(2, gap / 3), marginBottom: padding + 4 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: active ? "linear-gradient(165deg, rgba(212,175,55,0.20), rgba(212,175,55,0.05))" : "transparent",
                border: active ? "1px solid rgba(212,175,55,0.35)" : "1px solid transparent",
                boxShadow: active ? SHADOW.gold : "none",
                borderRadius: 10, padding: `${padding / 1.5}px 2px`, cursor: "pointer",
                color: active ? C.goldBright : C.mut, fontWeight: active ? 700 : 600,
                fontFamily: FONT_DISPLAY, letterSpacing: 0.3,
                fontSize: isMobile ? 10 : 11, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: isMobile ? 16 : 18 }}>{t.icon}</span>
                <span style={{ letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", lineHeight: 1.1, fontSize: isMobile ? 9 : 10 }}>{t.label}</span>
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
