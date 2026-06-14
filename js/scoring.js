/* ------------------------------------------------------------------ */
/*  SCORING                                                            */
/* ------------------------------------------------------------------ */

const blankResult = () => ({
  g: [{ gf: "", ga: "" }, { gf: "", ga: "" }, { gf: "", ga: "" }],
  stage: "GROUP",
  koGF: 0,
  koGA: 0,
  matches: [],
});

function num(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function teamScore(res, tier) {
  const r = res || blankResult();
  const w = WIN_PTS[tier] || 3;
  let pts = 0, gf = 0, ga = 0, wins = 0, draws = 0, losses = 0, cleanSheets = 0, played = 0;

  r.g.forEach((m) => {
    const a = num(m.gf), b = num(m.ga);
    if (a === null || b === null) return;
    played += 1; gf += a; ga += b;
    if (b === 0) cleanSheets += 1;
    if (a > b) { wins += 1; pts += w; }
    else if (a === b) { draws += 1; pts += 1; } // draw point: group stage only
    else { losses += 1; }
  });

  const koWins = KO_WINS[r.stage] || 0;
  pts += koWins * w;                       // knockout wins, tier-weighted
  pts += ROUND_BONUS[r.stage] || 0;        // round-reached bonus
  if (r.stage !== "GROUP") pts += REACH_KO_BONUS; // breadth: made the knockouts
  pts += PLACEMENT_BONUS[r.stage] || 0;    // finals placement

  gf += r.koGF || 0;
  ga += r.koGA || 0;

  return { pts, gf, ga, gd: gf - ga, wins: wins + koWins, draws, losses, cleanSheets, played, stage: r.stage };
}

function managerScore(squad, results) {
  let pts = 0, gf = 0, ga = 0, cleanSheets = 0, wins = 0;
  squad.forEach((code) => {
    const s = teamScore(results[code], TEAMS[code].tier);
    pts += s.pts; gf += s.gf; ga += s.ga; cleanSheets += s.cleanSheets; wins += s.wins;
  });
  return { pts, gf, ga, gd: gf - ga, cleanSheets, wins };
}

const ADV_BONUS = { R32: 2, R16: 4, QF: 6, SF: 8, THIRD: 2, FINAL: 8 };
// Points THIS team earned from a single completed match (incl. milestone bonuses)
function teamMatchPoints(code, m) {
  if (!m.completed) return null;
  const W = WIN_PTS[TEAMS[code].tier] || 3;
  if (m.round === "GROUP") {
    if (m.gf > m.ga) return { pts: W, detail: `${W} win` };
    if (m.gf === m.ga) return { pts: 1, detail: "draw" };
    return { pts: 0, detail: "loss" };
  }
  if (m.round === "R32") {
    return m.adv ? { pts: 3 + W + 2, detail: `+3 reached KO, ${W} win, +2 advance` } : { pts: 3, detail: "+3 reached knockouts" };
  }
  if (m.round === "FINAL") {
    return m.adv ? { pts: W + 8, detail: `${W} win, +8 champion 🏆` } : { pts: 4, detail: "+4 runner-up" };
  }
  if (m.round === "THIRD") {
    return m.adv ? { pts: W + 2, detail: `${W} win, +2 third place 🥉` } : { pts: 0, detail: "4th place" };
  }
  const adv = ADV_BONUS[m.round] || 0;
  return m.adv ? { pts: W + adv, detail: `${W} win, +${adv} advance` } : { pts: 0, detail: "lost" };
}
