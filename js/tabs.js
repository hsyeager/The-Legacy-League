function PointsTab({ results, api, onSelect }) {
  const rows = useMemo(() =>
    Object.keys(TEAMS)
      .map((code) => ({ code, tier: TEAMS[code].tier, pts: teamScore(results[code], TEAMS[code].tier).pts }))
      .sort((a, b) => b.pts - a.pts || a.tier - b.tier || TEAMS[a.code].name.localeCompare(TEAMS[b.code].name)),
  [results]);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <SectionTitle icon="⚽">Team Points</SectionTitle>
      <div style={{ color: C.mut2, fontSize: 12.5, marginTop: -4, marginBottom: 2 }}>
        Points each nation has earned for its managers. Tap a team to see all its results.
      </div>
      {rows.map((r, idx) => (
        <TeamRow key={r.code} code={r.code} tier={r.tier} pts={r.pts} rank={idx + 1}
          status={statusOf(api[r.code] || results[r.code])} onSelect={onSelect} />
      ))}
    </div>
  );
}

function RulesTab() {
  const body = { color: C.mut, fontSize: 14.5, lineHeight: 1.6, margin: 0 };
  const [tiersOpen, setTiersOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card style={{ textAlign: "center", padding: 28 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 64, height: 64, borderRadius: 18,
          background: C.goldGrad, boxShadow: SHADOW.gold, fontSize: 32, marginBottom: 12,
        }}>🌍</div>
        <h2 style={{ ...goldText, fontFamily: FONT_DISPLAY, fontWeight: 600, margin: "0 0 8px", letterSpacing: 2, fontSize: 24, textTransform: "uppercase" }}>How It Works</h2>
        <p style={{ ...body, maxWidth: 460, margin: "0 auto" }}>
          A tiered fantasy league for World Cup 2026. Every manager gets a fair mix — then it's down to the football.
        </p>
      </Card>

      <Card>
        <SectionTitle icon="🎯">The Draw</SectionTitle>
        <p style={body}>
          Before the tournament, all 12 managers take part in a randomised tiered draw. The 48 qualified
          nations are split into 4 tiers by pre-tournament betting odds. Each manager is randomly assigned
          one team from each tier — giving everyone one favourite, one contender, one dark horse, and one long shot.
        </p>
      </Card>

      <Card>
        <SectionTitle icon="🏅">Your Squad</SectionTitle>
        <p style={body}>
          Each manager ends up with exactly 4 national teams. Your teams' results across the entire World Cup —
          group stage through to the final — all count toward your score.
        </p>
      </Card>

      <Card>
        <SectionTitle icon="📊">Scoring</SectionTitle>
        <p style={body}>
          Win values reward underdogs: a win is worth <b style={{ color: C.text }}>3pts</b> for a
          Tier 1 or 2 team and <b style={{ color: C.text }}>5pts</b> for a Tier 3 or 4 team — in every round.
          Group-stage draws earn <b style={{ color: C.text }}>1pt</b>. Reaching the knockouts is worth
          <b style={{ color: C.text }}> +3pts</b> per team, then each further round adds a bonus:
          R16 +2, QF +4, SF +6, Final +8.
        </p>
      </Card>

      <Card>
        <SectionTitle icon="🏆">Placement Bonuses</SectionTitle>
        <p style={body}>
          Tournament finishers earn bonuses: the World Cup winner's manager gets <b style={{ color: C.text }}>+8pts</b>,
          runner-up <b style={{ color: C.text }}>+4pts</b>, and 3rd place <b style={{ color: C.text }}>+2pts</b>.
        </p>
      </Card>

      <Card>
        <SectionTitle icon="🔢">Tiebreakers</SectionTitle>
        <p style={body}>
          If managers are level on points: (1) goal difference across all 4 teams, (2) total goals scored,
          (3) total clean sheets, and (4) Harrison flips a coin.
        </p>
      </Card>

      <CollapsibleSection title="The Four Tiers" open={tiersOpen} onToggle={() => setTiersOpen((o) => !o)}>
        <Card>
          <div style={{ display: "grid", gap: 14 }}>
            {[1, 2, 3, 4].map((t) => (
              <div key={t} style={{
                borderTop: t === 1 ? "none" : `1px solid ${C.border}`, paddingTop: t === 1 ? 0 : 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <TierPill tier={t} />
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{TIER_META[t].name}</div>
                    <div style={{ color: C.mut2, fontSize: 13 }}>
                      Odds {TIER_META[t].odds}.{t === 4 ? " Zero pressure, maximum chaos." : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {Object.keys(TEAMS).filter((c) => TEAMS[c].tier === t).map((code) => (
                    <span key={code} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8,
                      padding: "4px 9px", color: C.text, fontSize: 12.5,
                    }}>
                      <Flag code={code} size={15} />{TEAMS[code].name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </CollapsibleSection>

      <CollapsibleSection title="The Draw" open={drawOpen} onToggle={() => setDrawOpen((o) => !o)}>
        {SQUADS.map((squad, i) => (
          <Card key={i} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ color: C.goldBright, fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", paddingTop: 2 }}>
                Group {i + 1}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {squad.map((code) => {
                  const m = TIER_META[TEAMS[code].tier];
                  return (
                    <div key={code} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      width: 52, padding: "6px 4px", borderRadius: 10,
                      background: C.bg2, border: `1px solid ${m.color}55`,
                    }}>
                      <Flag code={code} size={19} />
                      <span style={{ color: C.mut, fontSize: 10, fontWeight: 700 }}>{code}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <ManagerNames i={i} />
            </div>
          </Card>
        ))}
      </CollapsibleSection>
    </div>
  );
}

function StandingsTab({ api, results, onSelect }) {
  const [div, setDiv] = useState("gold");
  const [expanded, setExpanded] = useState({});
  const divColor = DIV_COLOR[div];
  const isMobile = typeof window !== "undefined" && window.innerWidth < 481;

  const rows = useMemo(() => {
    return SQUADS.map((squad, i) => ({
      i, squad, ...managerScore(squad, results),
    })).sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || b.cleanSheets - a.cleanSheets
    );
  }, [results]);

  const medal = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <SectionTitle icon="📊">Standings</SectionTitle>

      {/* Division toggle */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: isMobile ? 4 : 6 }}>
        {DIVISIONS.map((d) => {
          const active = div === d.key;
          return (
            <button key={d.key} onClick={() => setDiv(d.key)} style={{
              background: active ? `linear-gradient(165deg, ${d.color}33, ${d.color}0d)` : "transparent",
              border: `1px solid ${active ? d.color : C.border}`,
              boxShadow: active ? `0 4px 14px ${d.color}33, ${SHADOW.inset}` : "none",
              color: active ? d.color : C.mut, borderRadius: 8, padding: isMobile ? "8px 3px" : "10px 4px",
              fontFamily: FONT_DISPLAY, fontSize: isMobile ? 10.5 : 11.5, fontWeight: active ? 600 : 500,
              letterSpacing: 0.5, lineHeight: 1.15, cursor: "pointer", textTransform: "uppercase",
              transition: "all 0.2s",
            }}>{d.label}</button>
          );
        })}
      </div>
      <div style={{ color: C.mut2, fontSize: isMobile ? 11 : 12, marginBottom: 2 }}>
        {DIVISIONS.find((d) => d.key === div).label} league
      </div>

      {rows.map((r, rank) => {
        const open = !!expanded[r.i];
        const sorted = [...r.squad].sort((a, b) => TEAMS[a].tier - TEAMS[b].tier);
        return (
          <Card key={r.i} style={{
            padding: isMobile ? 10 : 14,
            borderColor: rank === 0 ? `${divColor}66` : C.border,
            boxShadow: rank === 0 ? `${SHADOW.card}, 0 0 0 1px ${divColor}22, ${SHADOW.inset}` : `${SHADOW.card}, ${SHADOW.inset}`,
          }}>
            <button onClick={() => setExpanded((e) => ({ ...e, [r.i]: !e[r.i] }))} style={{
              display: "flex", alignItems: "flex-start", gap: isMobile ? 8 : 12,
              width: "100%", textAlign: "left", background: "none", border: "none", padding: 0,
              color: "inherit", font: "inherit", cursor: "pointer",
            }}>
              <div style={{ width: isMobile ? 24 : 30, textAlign: "center", fontFamily: FONT_DISPLAY, fontSize: rank < 3 ? (isMobile ? 18 : 20) : (isMobile ? 13 : 15), color: C.mut, fontWeight: 600, flexShrink: 0 }}>
                {medal[rank] || rank + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: divColor, fontWeight: 700, fontSize: isMobile ? 13 : 15 }}>{MANAGERS[r.i][div]}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "2px 6px" : "3px 10px", marginTop: 4, fontSize: isMobile ? 11 : 12, color: C.mut }}>
                  <span style={{ color: C.mut2, fontWeight: 700 }}>G{r.i + 1}</span>
                  {r.squad.map((c) => (
                    <span key={c} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Flag code={c} size={isMobile ? 11 : 13} /> {isMobile ? c : TEAMS[c].name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: divColor, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: isMobile ? 19 : 23, lineHeight: 1 }}>{r.pts}</div>
                <div style={{ color: C.mut2, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>pts</div>
              </div>
              <span style={{
                color: C.mut2, fontSize: 13, width: 22, height: 22, borderRadius: 999, flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)",
                transform: open ? "rotate(90deg)" : "none", transition: "transform .15s",
              }}>›</span>
            </button>
            <div style={{ display: "flex", gap: isMobile ? 10 : 14, marginTop: 6, color: C.mut2, fontSize: isMobile ? 10 : 11.5, flexWrap: "wrap" }}>
              <span>GD {r.gd >= 0 ? "+" : ""}{r.gd}</span>
              <span>GF {r.gf}</span>
              <span>Wins {r.wins}</span>
              <span>CS {r.cleanSheets}</span>
            </div>
            {open && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                {sorted.map((code) => {
                  const sc = teamScore(results[code], TEAMS[code].tier);
                  return (
                    <TeamRow key={code} code={code} tier={TEAMS[code].tier} pts={sc.pts}
                      status={statusOf(api[code])} stats={sc} onSelect={onSelect} variant="list" />
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// Shows the gold/silver/bronze managers who own a team, with a dot in their division color.
function TeamOwners({ code, align }) {
  const i = TEAM_SQUAD[code];
  if (i == null) return null;
  const m = MANAGERS[i];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: align }}>
      {DIVISIONS.map((d) => (
        <span key={d.key} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: C.mut2, whiteSpace: "nowrap" }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: d.color, flexShrink: 0 }} />
          {m[d.key]}
        </span>
      ))}
    </div>
  );
}

function MatchRow({ m }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 481;
  const dt = (() => {
    try {
      return new Date(m.date).toLocaleString("en-US", {
        timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      }) + " CT";
    } catch (e) { return ""; }
  })();
  const hasScore = m.home.score !== null && m.away.score !== null;
  const isLive = hasScore && !m.completed;
  const Side = ({ s, right }) => (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", gap: isMobile ? 4 : 6, minWidth: 0,
      justifyContent: right ? "flex-end" : "flex-start",
      color: (m.completed || isLive) && s.win ? C.text : C.mut, fontWeight: (m.completed || isLive) && s.win ? 800 : 600, fontSize: isMobile ? 12 : 13,
    }}>
      {right && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right", fontSize: isMobile ? 11 : "inherit" }}>{isMobile ? s.name.substring(0, 3) : s.name}</span>}
      {s.code ? <Flag code={s.code} size={isMobile ? 14 : 16} /> : <span style={{ fontSize: isMobile ? 12 : 14 }}>•</span>}
      {!right && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: isMobile ? 11 : "inherit" }}>{isMobile ? s.name.substring(0, 3) : s.name}</span>}
    </div>
  );
  const hasStarted = hasScore;
  return (
    <Card style={{
      padding: isMobile ? 10 : 12,
      borderColor: isLive ? `${C.live}55` : hasStarted ? undefined : "rgba(255,255,255,0.03)",
      boxShadow: isLive ? `${SHADOW.card}, 0 0 0 1px ${C.live}22, ${SHADOW.inset}` : `${SHADOW.card}, ${SHADOW.inset}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
        <span style={{ color: C.goldBright, fontFamily: FONT_DISPLAY, fontSize: isMobile ? 10 : 11, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {isMobile ? `M${m.matchNo}` : `Match ${m.matchNo}`} <span style={{ color: C.mut2, fontWeight: 500, fontSize: isMobile ? 9 : "inherit" }}>· {isMobile ? ROUND_LABEL[m.round]?.split(" ")[0] || "" : ROUND_LABEL[m.round] || ""}</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isLive && <span style={{ width: 5, height: 5, borderRadius: 99, background: C.live, boxShadow: `0 0 6px ${C.live}`, animation: "pulse 1.5s infinite", flexShrink: 0 }} />}
          <span style={{ color: isLive ? C.live : C.mut2, fontSize: isMobile ? 10 : 11, fontWeight: isLive ? 700 : 400 }}>
            {isLive ? "LIVE" : (isMobile ? new Date(m.date).toLocaleDateString() : dt)}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
        <Side s={m.home} right={false} />
        <div style={{
          flexShrink: 0, minWidth: isMobile ? 38 : 50, textAlign: "center",
          padding: isMobile ? "3px 2px" : "4px 2px", borderRadius: 8,
          background: hasScore ? "rgba(255,255,255,0.04)" : "transparent",
        }}>
          <span style={{
            display: "block", fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: isMobile ? 15 : 17, letterSpacing: 0.5,
            color: hasScore ? C.text : C.mut2,
          }}>
            {hasScore ? `${m.home.score}\u2013${m.away.score}` : "vs"}
          </span>
          {isLive && m.gameTime && <span style={{ display: "block", color: C.live, fontSize: 9, fontWeight: 700, marginTop: 1 }}>
            {m.gameTime}
          </span>}
        </div>
        <Side s={m.away} right={true} />
      </div>
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}><TeamOwners code={m.home.code} align="flex-start" /></div>
          <span style={{ flexShrink: 0, width: 46 }} />
          <div style={{ flex: 1, minWidth: 0 }}><TeamOwners code={m.away.code} align="flex-end" /></div>
        </div>
      )}
    </Card>
  );
}

function GameLogTab({ schedule }) {
  const [openPast, setOpenPast] = useState(false);
  const [openToday, setOpenToday] = useState(true);
  const [openFutureDates, setOpenFutureDates] = useState({});

  const ctDay = (iso) => { try { return new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/Chicago" }); } catch (e) { return ""; } };
  const dateLabel = (d) => { try { return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "America/Chicago", weekday: "long", month: "long", day: "numeric" }); } catch (e) { return d; } };
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

  const past = [], todayG = [], future = [];
  (schedule || []).forEach((m) => {
    const d = ctDay(m.date);
    if (!d) return;
    if (d < today) past.push(m);
    else if (d === today) todayG.push(m);
    else future.push(m);
  });

  const futureByDate = [];
  future.forEach((m) => {
    const d = ctDay(m.date);
    const group = futureByDate[futureByDate.length - 1];
    if (group && group.date === d) group.matches.push(m);
    else futureByDate.push({ date: d, matches: [m] });
  });

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SectionTitle icon="📅">Game Log</SectionTitle>
      <div style={{ color: C.mut2, fontSize: 12.5, marginTop: -4 }}>
        All 104 matches, numbered in order, with kickoff times in Central. Matchups fill in as the bracket is set; results appear once games finish.
      </div>

      {(!schedule || schedule.length === 0) && (
        <Card style={{ padding: 16 }}>
          <span style={{ color: C.mut2, fontSize: 13 }}>Syncing the schedule from ESPN — tap “Sync now” up top if this stays empty.</span>
        </Card>
      )}

      <CollapsibleSection title={`Past (${past.length})`} open={openPast} onToggle={() => setOpenPast((o) => !o)}>
        {past.length ? past.map((m) => <MatchRow key={m.matchNo} m={m} />) : <Card style={{ padding: 12 }}><span style={{ color: C.mut2, fontSize: 13 }}>No completed match days yet.</span></Card>}
      </CollapsibleSection>

      <CollapsibleSection title={`Today (${todayG.length})`} open={openToday} onToggle={() => setOpenToday((o) => !o)}>
        {todayG.length ? todayG.map((m) => <MatchRow key={m.matchNo} m={m} />) : <Card style={{ padding: 12 }}><span style={{ color: C.mut2, fontSize: 13 }}>No matches scheduled today.</span></Card>}
      </CollapsibleSection>

      {futureByDate.length ? futureByDate.map(({ date, matches }) => (
        <CollapsibleSection
          key={date}
          title={`${dateLabel(date)} (${matches.length})`}
          open={!!openFutureDates[date]}
          onToggle={() => setOpenFutureDates((o) => ({ ...o, [date]: !o[date] }))}
        >
          {matches.map((m) => <MatchRow key={m.matchNo} m={m} />)}
        </CollapsibleSection>
      )) : (
        <Card style={{ padding: 12 }}><span style={{ color: C.mut2, fontSize: 13 }}>No upcoming matches.</span></Card>
      )}
    </div>
  );
}

function TournamentTab({ api, schedule }) {
  // Build list of groups from teams' group matches
  const groups = useMemo(() => {
    const groupMap = {};
    Object.keys(TEAMS).forEach((code) => {
      const matches = (api[code]?.matches || []).filter((m) => m.round === "GROUP");
      const opponents = new Set();
      matches.forEach((m) => { if (m.oppCode) opponents.add(m.oppCode); });
      opponents.add(code);

      const groupId = Array.from(opponents).sort().join("-");
      if (!groupMap[groupId]) groupMap[groupId] = [];
      groupMap[groupId].push(code);
    });

    return Object.values(groupMap).map((teams) => {
      const standings = teams.map((code) => {
        const r = api[code];
        const matches = (r?.matches || []).filter((m) => m.round === "GROUP");
        let p = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0;
        matches.forEach((m) => {
          if (!m.completed) return;
          p++; gf += m.gf || 0; ga += m.ga || 0;
          if (m.gf > m.ga) w++;
          else if (m.gf === m.ga) d++;
          else l++;
        });
        const pts = w * 3 + d;
        const gd = gf - ga;
        return { code, p, w, d, l, gf, ga, gd, pts, pos: r?.groupPos || 0 };
      });
      standings.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      return standings;
    });
  }, [api]);

  const GroupTable = ({ standings, groupNum }) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 481;
    const isTablet = typeof window !== "undefined" && window.innerWidth >= 481 && window.innerWidth < 769;

    // Define grid template columns for each breakpoint
    // Mobile: [4] | [Team] | [W] | [L] | [GD] | [Pts]
    // Tablet: [4] | [Team] | [W] | [D] | [L] | [GD] | [Pts]
    // Desktop: [4] | [Team] | [P] | [W] | [D] | [L] | [GF] | [GA] | [GD] | [Pts]
    const gridCols = isMobile
      ? "24px minmax(80px, 1fr) 24px 24px 32px 32px"
      : isTablet
      ? "26px minmax(100px, 1fr) 28px 28px 28px 36px 36px"
      : "30px minmax(120px, 1fr) 30px 30px 30px 30px 30px 30px 36px 40px";

    const fontSize = isMobile ? 11 : isTablet ? 12 : 13;
    const headerFontSize = isMobile ? 9 : isTablet ? 10 : 11;
    const headerGap = isMobile ? 1 : isTablet ? 4 : 8;
    const rowGap = isMobile ? 6 : isTablet ? 8 : 10;

    return (
      <Card style={{ padding: isMobile ? 10 : 16 }}>
        <div style={{ color: C.goldBright, fontFamily: FONT_DISPLAY, fontSize: isMobile ? 11 : 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: isMobile ? 6 : 10 }}>
          Group {groupNum}
        </div>

        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: headerGap,
          alignItems: "center",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: isMobile ? 4 : 6,
          marginBottom: isMobile ? 4 : 6,
          color: C.mut2,
          fontFamily: FONT_DISPLAY,
          fontSize: headerFontSize,
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          width: "100%",
          overflow: "hidden",
        }}>
          <div style={{ textAlign: "center" }}>Pos</div>
          <div style={{ textAlign: "left" }}>Team</div>
          {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>P</div>}
          <div style={{ textAlign: "center" }}>W</div>
          {!isMobile && <div style={{ textAlign: "center" }}>D</div>}
          <div style={{ textAlign: "center" }}>L</div>
          {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>GF</div>}
          {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>GA</div>}
          <div style={{ textAlign: "center" }}>GD</div>
          <div style={{ textAlign: "center" }}>Pts</div>
        </div>

        {/* Data rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%", overflow: "hidden" }}>
          {standings.map((t, idx) => {
            const qual = t.pos === 1 || t.pos === 2 ? C.win : C.text;
            const isQualified = idx < 2;
            return (
              <div
                key={t.code}
                style={{
                  display: "grid",
                  gridTemplateColumns: gridCols,
                  gap: headerGap,
                  alignItems: "center",
                  padding: `${isMobile ? 5 : 7}px 0`,
                  borderTop: `1px solid ${C.border}`,
                  background: isQualified ? C.winBg : "transparent",
                  fontSize,
                  color: qual,
                }}
              >
                <div style={{ textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 600, color: qual }}>
                  {t.pos || idx + 1}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 3 : 5 }}>
                  <Flag code={t.code} size={isMobile ? 12 : isTablet ? 14 : 16} />
                  <span style={{ color: qual, fontSize: isMobile ? 10 : 12 }}>
                    {TEAMS[t.code].name}
                  </span>
                </div>
                {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>{t.p}</div>}
                <div style={{ textAlign: "center", fontWeight: 600 }}>{t.w}</div>
                {!isMobile && <div style={{ textAlign: "center", fontWeight: 600 }}>{t.d}</div>}
                <div style={{ textAlign: "center", fontWeight: 600 }}>{t.l}</div>
                {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>{t.gf}</div>}
                {!isMobile && !isTablet && <div style={{ textAlign: "center" }}>{t.ga}</div>}
                <div style={{ textAlign: "center", fontWeight: 600, color: t.gd >= 0 ? C.win : C.red }}>
                  {t.gd >= 0 ? "+" : ""}{t.gd}
                </div>
                <div style={{ textAlign: "center", fontFamily: FONT_DISPLAY, fontWeight: 600, color: C.goldBright, fontSize: isMobile ? 13 : 14 }}>
                  {t.pts}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  const BracketMatch = ({ match, stage }) => {
    if (!match) return <div style={{ height: 50, border: `1px dashed ${C.border}`, borderRadius: 8, background: "rgba(255,255,255,0.02)" }} />;
    const homeWon = match.home.score !== null && match.home.win;
    const awayWon = match.away.score !== null && match.away.win;
    return (
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: C.cardGrad, boxShadow: `${SHADOW.card}, ${SHADOW.inset}`, fontSize: 12 }}>
        <div style={{
          padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, background: homeWon ? C.winBgStrong : "transparent",
          borderBottom: `1px solid ${C.border}`,
        }}>
          {match.home.code ? <Flag code={match.home.code} size={14} /> : <span style={{ fontSize: 10 }}>•</span>}
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: homeWon ? C.win : C.text, fontWeight: homeWon ? 700 : 600 }}>
            {match.home.name}
          </span>
          {match.home.score !== null && <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, minWidth: 20, textAlign: "right" }}>{match.home.score}</span>}
        </div>
        <div style={{
          padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, background: awayWon ? C.winBgStrong : "transparent",
        }}>
          {match.away.code ? <Flag code={match.away.code} size={14} /> : <span style={{ fontSize: 10 }}>•</span>}
          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: awayWon ? C.win : C.text, fontWeight: awayWon ? 700 : 600 }}>
            {match.away.name}
          </span>
          {match.away.score !== null && <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 14, minWidth: 20, textAlign: "right" }}>{match.away.score}</span>}
        </div>
      </div>
    );
  };

  const Bracket = () => {
    const stages = ["R32", "R16", "QF", "SF", "FINAL"];
    const stageMatches = {};
    stages.forEach((s) => { stageMatches[s] = []; });
    (schedule || []).forEach((m) => {
      if (stages.includes(m.round)) stageMatches[m.round].push(m);
    });

    return (
      <div style={{ overflowX: "auto", paddingBottom: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, minmax(130px, 1fr))`, gap: 12, minWidth: "100%" }}>
          {stages.map((stage) => (
            <div key={stage}>
              <div style={{ color: C.goldBright, fontFamily: FONT_DISPLAY, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
                {ROUND_LABEL[stage] || stage}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {stageMatches[stage].length > 0 ? (
                  stageMatches[stage].map((m) => <BracketMatch key={m.matchNo} match={m} stage={stage} />)
                ) : (
                  <div style={{ color: C.mut2, fontSize: 12, textAlign: "center", padding: "20px 8px" }}>
                    Pending
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div>
        <SectionTitle icon="🏆">Group Stage Standings</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          {groups.map((standings, idx) => (
            <GroupTable key={idx} standings={standings} groupNum={idx + 1} />
          ))}
        </div>
      </div>

      <div>
        <SectionTitle icon="🎯">Knockout Bracket</SectionTitle>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 16 }}>
            <Bracket />
          </div>
        </Card>
      </div>
    </div>
  );
}
