/* ------------------------------------------------------------------ */
/*  SMALL UI PIECES                                                    */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#05080f",
  bg2: "#0a111f",
  card: "#101a2e",
  cardHi: "#17243c",
  cardGrad: "linear-gradient(165deg, #1a2740 0%, #0e1727 100%)",
  border: "rgba(255,255,255,0.07)",
  borderLight: "rgba(255,255,255,0.14)",
  gold: "#d4af37",
  goldBright: "#f6d87c",
  goldDeep: "#9c7a22",
  goldGrad: "linear-gradient(135deg, #f6d87c 0%, #d4af37 55%, #a6791f 100%)",
  green: "#1fa463",
  greenBright: "#3fd68a",
  text: "#eef2fa",
  mut: "#8c9bb2",
  mut2: "#5e6e87",
  red: "#e15b73",
  win: "#3fd68a",
  winBg: "rgba(63,214,138,0.05)",
  winBgStrong: "rgba(63,214,138,0.10)",
  live: "#ff6b6b",
};

// Elevation + glow shadows used to give cards, badges and buttons depth.
const SHADOW = {
  card: "0 6px 18px rgba(0,0,0,0.35)",
  raised: "0 10px 28px rgba(0,0,0,0.45)",
  gold: "0 4px 16px rgba(212,175,55,0.28)",
  inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
};

const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Gold-gradient text treatment for headings/figures — spread into a style object.
const goldText = {
  backgroundImage: C.goldGrad,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

function Flag({ code, size = 22 }) {
  const t = TEAMS[code];
  return (
    <span style={{ fontSize: size, lineHeight: 1, filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.35))" }} title={t?.name}>
      {t?.flag}
    </span>
  );
}

function TierPill({ tier, small }) {
  const m = TIER_META[tier];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      border: `1px solid ${m.color}`, color: m.color,
      background: `linear-gradient(135deg, ${m.bg} 0%, rgba(255,255,255,0) 100%)`,
      borderRadius: 999, padding: small ? "1px 9px" : "3px 12px",
      fontSize: small ? 11 : 12, fontWeight: 600, letterSpacing: 0.3, whiteSpace: "nowrap",
      fontFamily: FONT_DISPLAY, textTransform: "uppercase",
    }}>{`Tier ${tier}`}</span>
  );
}

function Card({ children, style }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 481;
  return (
    <div style={{
      background: C.cardGrad, border: `1px solid ${C.border}`, borderRadius: 16,
      padding: isMobile ? 8 : 18, boxShadow: `${SHADOW.card}, ${SHADOW.inset}`,
      ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      {icon && (
        <span style={{
          fontSize: 15, width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgba(212,175,55,0.20), rgba(212,175,55,0.04))",
          border: "1px solid rgba(212,175,55,0.25)",
        }}>{icon}</span>
      )}
      <h3 style={{
        margin: 0, fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 600,
        letterSpacing: 1.5, textTransform: "uppercase", ...goldText,
      }}>{children}</h3>
    </div>
  );
}

function ManagerNames({ i, size = 13, gap = 2 }) {
  const m = MANAGERS[i] || {};
  return (
    <div style={{ display: "grid", gap }}>
      {DIVISIONS.map((d) => (
        <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: d.color, boxShadow: `0 0 6px ${d.color}99`, flexShrink: 0 }} />
          <span style={{ color: d.color, fontSize: size, fontWeight: 700 }}>{m[d.key]}</span>
        </div>
      ))}
    </div>
  );
}

const MEDAL = ["🥇", "🥈", "🥉"];

// Shared row for a single team: flag, name + status, optional GD/GF/W/CS stats,
// tier pill, points, and a chevron. Used by PointsTab (variant "card") and
// TeamsTab (variant "list", with per-team stats).
function TeamRow({ code, tier, pts, status, onSelect, rank, stats, variant = "card" }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 481;
  const nameCol = status.elim ? C.red : status.gold ? C.goldBright : C.text;
  const statusCol = status.elim ? C.red : status.gold ? C.goldBright : C.mut2;
  const wrapStyle = variant === "card"
    ? { background: C.cardGrad, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", boxShadow: `${SHADOW.card}, ${SHADOW.inset}` }
    : { background: "transparent", border: "none", borderTop: `1px solid ${C.border}`, padding: "9px 0" };
  return (
    <button onClick={() => onSelect(code)} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", cursor: "pointer",
      ...wrapStyle,
    }}>
      {rank != null && (
        <span style={{ width: 20, textAlign: "center", fontSize: rank <= 3 ? 15 : 12, color: C.mut2, fontWeight: 700, flexShrink: 0 }}>
          {rank <= 3 ? MEDAL[rank - 1] : rank}
        </span>
      )}
      <Flag code={code} size={20} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: nameCol, fontSize: 14.5, fontWeight: 600, textDecoration: status.elim ? "line-through" : "none" }}>{TEAMS[code].name}</div>
        {status.label && <div style={{ color: statusCol, fontSize: 11, marginTop: 1 }}>{status.label}</div>}
        {stats && (
          <div style={{ display: "flex", gap: isMobile ? 8 : 12, marginTop: 2, color: C.mut2, fontSize: isMobile ? 10 : 11, flexWrap: "wrap" }}>
            <span>GD {stats.gd >= 0 ? "+" : ""}{stats.gd}</span>
            <span>GF {stats.gf}</span>
            <span>W {stats.wins}</span>
            <span>CS {stats.cleanSheets}</span>
          </div>
        )}
      </div>
      <TierPill tier={tier} small />
      <span style={{ ...goldText, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 19, minWidth: 30, textAlign: "right" }}>{pts}</span>
      <span style={{
        color: C.mut2, fontSize: 13, width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)",
      }}>›</span>
    </button>
  );
}

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" }); }
  catch (e) { return ""; }
}

function TeamDetail({ code, api, results, onClose }) {
  if (!code) return null;
  const t = TEAMS[code];
  const sc = teamScore(results[code], t.tier);
  const matches = (api[code] && api[code].matches) || [];
  const s = statusOf(api[code] || results[code]);
  const nameCol = s.elim ? C.red : s.gold ? C.goldBright : C.text;
  const anyPens = matches.some((m) => m.completed && m.round !== "GROUP" && m.gf === m.ga);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 60,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: `linear-gradient(165deg, ${C.cardHi} 0%, ${C.bg2} 100%)`,
        border: `1px solid ${C.borderLight}`, borderBottom: "none",
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        width: "100%", maxWidth: 560, maxHeight: "82vh", overflowY: "auto", padding: 18,
        boxShadow: "0 -12px 40px rgba(0,0,0,0.55)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
          <Flag code={code} size={30} />
          <div style={{ flex: 1 }}>
            <div style={{ color: nameCol, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 19, letterSpacing: 0.3, lineHeight: 1.1, textDecoration: s.elim ? "line-through" : "none" }}>{t.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <TierPill tier={t.tier} small />
              <span style={{ color: s.elim ? C.red : C.mut2, fontSize: 12 }}>{s.label || STAGE_DESC[sc.stage]}{s.elim ? " · eliminated" : ""}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...goldText, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, lineHeight: 1 }}>{sc.pts}</div>
            <div style={{ color: C.mut2, fontSize: 11 }}>points</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.mut,
            borderRadius: 999, width: 30, height: 30, cursor: "pointer", fontSize: 14, flexShrink: 0,
          }}>✕</button>
        </div>

        {matches.length === 0 ? (
          <div style={{ color: C.mut2, fontSize: 13, padding: "12px 2px" }}>
            No games recorded yet — results appear here once matches kick off and the feed syncs.
          </div>
        ) : (
          <>
            <div style={{ color: C.mut2, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", margin: "2px 2px 6px" }}>
              How the points add up
            </div>
            <div style={{ background: C.cardGrad, border: `1px solid ${C.border}`, borderRadius: 12, padding: "4px 14px", boxShadow: SHADOW.inset }}>
              {matches.map((m, i) => {
                const played = m.completed;
                let res = "", col = C.mut2;
                if (played) {
                  if (m.round === "GROUP") res = m.gf > m.ga ? "W" : m.gf === m.ga ? "D" : "L";
                  else res = m.adv ? "W" : "L";
                  col = res === "W" ? C.win : res === "D" ? C.gold : C.red;
                }
                const pens = played && m.round !== "GROUP" && m.gf === m.ga;
                const tp = teamMatchPoints(code, m);
                return (
                  <div key={i} style={{ padding: "10px 0", borderTop: i ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 90, flexShrink: 0 }}>
                        <div style={{ color: C.mut, fontSize: 11, fontWeight: 700 }}>{ROUND_LABEL[m.round]}</div>
                        <div style={{ color: C.mut2, fontSize: 10.5 }}>{fmtDate(m.date)}</div>
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, color: C.text, fontSize: 13, minWidth: 0 }}>
                        <span style={{ color: C.mut2 }}>vs</span>
                        {m.oppCode && <Flag code={m.oppCode} size={15} />}
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.opp}</span>
                      </div>
                      {played ? (
                        <>
                          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{m.gf}–{m.ga}{pens ? "*" : ""}</span>
                          <span style={{ width: 18, textAlign: "center", color: col, fontWeight: 800, fontSize: 13 }}>{res}</span>
                        </>
                      ) : (
                        <span style={{ color: C.mut2, fontSize: 12 }}>upcoming</span>
                      )}
                    </div>
                    {tp && (
                      <div style={{ marginTop: 4, marginLeft: 100, fontSize: 11.5 }}>
                        <span style={{ color: tp.pts > 0 ? C.win : C.mut2, fontWeight: 700 }}>
                          {tp.pts > 0 ? `+${tp.pts}` : "0"} pts
                        </span>
                        <span style={{ color: C.mut2 }}>{"  ·  "}{tp.detail}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderTop: `1px solid ${C.gold}55`, marginTop: 2,
              }}>
                <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>Total</span>
                <span style={{ ...goldText, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17 }}>{sc.pts} pts</span>
              </div>
            </div>
          </>
        )}
        {anyPens && <div style={{ color: C.mut2, fontSize: 11, marginTop: 8 }}>* advanced on penalties</div>}
      </div>
    </div>
  );
}

function CollapsibleSection({ title, open, onToggle, children }) {
  return (
    <div>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        background: C.cardGrad, border: `1px solid ${open ? C.borderLight : C.border}`, borderRadius: 12,
        cursor: "pointer", padding: "14px 16px", boxShadow: `${SHADOW.card}, ${SHADOW.inset}`,
      }}>
        <span style={{ flex: 1, textAlign: "left", fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", ...goldText }}>{title}</span>
        <span style={{
          color: C.mut2, fontSize: 13, width: 22, height: 22, borderRadius: 999, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)",
          transform: open ? "rotate(90deg)" : "none", transition: "transform .15s",
        }}>›</span>
      </button>
      {open && <div style={{ marginTop: 10, display: "grid", gap: 12 }}>{children}</div>}
    </div>
  );
}
