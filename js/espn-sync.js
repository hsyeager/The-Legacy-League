/* ------------------------------------------------------------------ */
/*  ESPN LIVE SYNC                                                     */
/*  Endpoint: site.api.espn.com  (no key, JSON, CORS-open)             */
/* ------------------------------------------------------------------ */

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=950&dates=20260611-20260720";

// Map ESPN team strings -> our codes. Seed with our own names/codes, then aliases.
const SYN = {};
Object.keys(TEAMS).forEach((c) => {
  SYN[c.toLowerCase()] = c;
  SYN[TEAMS[c].name.toLowerCase()] = c;
});
const alias = (code, ...keys) => keys.forEach((k) => { SYN[k.toLowerCase()] = code; });
alias("ES", "esp"); alias("BE", "bel"); alias("FR", "fra"); alias("AR", "arg");
alias("ENG", "eng"); alias("PT", "por", "portugal"); alias("NO", "nor"); alias("BR", "bra");
alias("DE", "ger", "germany"); alias("CO", "col"); alias("NL", "ned", "holland");
alias("MA", "mar", "morocco"); alias("JP", "jpn"); alias("CH", "sui", "switzerland");
alias("HR", "cro", "croatia"); alias("EC", "ecu"); alias("MX", "mex"); alias("UY", "uru");
alias("AT", "aut"); alias("US", "usa", "united states", "united states of america");
alias("SWE", "swe"); alias("SN", "sen"); alias("SCO", "sco");
alias("TR", "tur", "türkiye", "turkiye"); alias("KR", "kor", "korea republic", "korea", "republic of korea");
alias("CA", "can"); alias("AU", "aus"); alias("BIH", "bih", "bosnia and herzegovina", "bosnia-herzegovina");
alias("EG", "egy"); alias("CIV", "civ", "côte d'ivoire", "cote d'ivoire", "ivory coast");
alias("GH", "gha"); alias("IRN", "iri", "irn", "iran ir", "ir iran");
alias("DZ", "alg", "dza"); alias("CZE", "cze", "czechia"); alias("PAR", "par");
alias("TN", "tun"); alias("COD", "cod", "drc", "congo dr", "dr congo", "democratic republic of the congo", "congo");
alias("PAN", "pan"); alias("IRQ", "irq"); alias("JOR", "jor"); alias("UZB", "uzb");
alias("QA", "qat"); alias("RSA", "rsa", "saf"); alias("HAI", "hai");
alias("CPV", "cpv", "cabo verde", "cape verde"); alias("NZ", "nzl");
alias("CUW", "cuw", "curaçao"); alias("KSA", "ksa", "sau");

function resolveCode(team) {
  if (!team) return null;
  const keys = [team.abbreviation, team.displayName, team.shortDisplayName, team.name, team.location]
    .filter(Boolean).map((s) => String(s).toLowerCase().trim());
  for (const k of keys) if (SYN[k]) return SYN[k];
  return null;
}

function broadcastInfo(comp) {
  const geo = comp.geoBroadcasts || [];
  const tv = geo.find((b) => b.type?.shortName === "TV");
  const stream = geo.find((b) => b.type?.shortName === "STREAMING");
  return { tv: tv?.media?.shortName || null, stream: stream?.media?.shortName || null };
}

function classifyLabel(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("group")) return "GROUP";
  if (l.includes("32")) return "R32";
  if (l.includes("16")) return "R16";
  if (l.includes("quarter")) return "QF";
  if (l.includes("semi")) return "SF";       // before "final" (semifinal contains "final")
  if (l.includes("3rd") || l.includes("third")) return "THIRD";
  if (l.includes("final")) return "FINAL";
  return "GROUP";
}

function parseEvents(json) {
  const entries = json?.leagues?.[0]?.calendar?.[0]?.entries || [];
  const windows = entries.map((e) => ({
    start: new Date(e.startDate), end: new Date(e.endDate), type: classifyLabel(e.label),
  }));
  const roundOf = (dateStr) => {
    const d = new Date(dateStr);
    const w = windows.find((w) => d >= w.start && d < w.end);
    return w ? w.type : "GROUP";
  };

  const groupAcc = {}, fixtures = {}, koGoals = {}, logs = {}, schedule = [];
  let finalWinner = null, thirdWinner = null;
  const nameOf = (team, code) => code ? TEAMS[code].name : (team?.displayName || team?.shortDisplayName || team?.name || "TBD");

  for (const ev of json?.events || []) {
    const comp = ev.competitions?.[0];
    if (!comp) continue;
    const completed = comp.status?.type?.completed === true || comp.status?.type?.state === "post";
    const isLive = comp.status?.type?.state === "in";
    const gameTime = comp.status?.displayClock || null;
    const cs = comp.competitors || [];
    if (cs.length < 2) continue;
    const [A, B] = cs;
    const ca = resolveCode(A.team), cb = resolveCode(B.team);
    const sa = parseInt(A.score, 10), sb = parseInt(B.score, 10);
    const round = roundOf(ev.date);
    const haveScore = Number.isFinite(sa) && Number.isFinite(sb);

    const pushLog = (code, oppTeam, oppCode, gf, ga, isWinner) => {
      if (!code) return;
      (logs[code] = logs[code] || []).push({
        round, date: ev.date, opp: nameOf(oppTeam, oppCode), oppCode: oppCode || null,
        gf: haveScore ? gf : null, ga: haveScore ? ga : null,
        completed: !!completed && haveScore, adv: isWinner === true,
      });
    };
    pushLog(ca, B.team, cb, sa, sb, A.winner);
    pushLog(cb, A.team, ca, sb, sa, B.winner);

    const hasStarted = completed || isLive;
    const { tv, stream } = broadcastInfo(comp);
    schedule.push({
      date: ev.date, round,
      completed: !!completed && haveScore,
      gameTime: gameTime && isLive ? gameTime : null,
      tv, stream,
      home: { code: ca, name: nameOf(A.team, ca), score: hasStarted && haveScore ? sa : null, win: A.winner === true },
      away: { code: cb, name: nameOf(B.team, cb), score: hasStarted && haveScore ? sb : null, win: B.winner === true },
    });

    if (round === "GROUP") {
      if (completed && haveScore) {
        if (ca) (groupAcc[ca] = groupAcc[ca] || []).push({ gf: String(sa), ga: String(sb) });
        if (cb) (groupAcc[cb] = groupAcc[cb] || []).push({ gf: String(sb), ga: String(sa) });
      }
    } else {
      [ca, cb].forEach((c) => { if (c) (fixtures[c] = fixtures[c] || new Set()).add(round); });
      if (completed) {
        if (haveScore) {
          if (ca) { koGoals[ca] = koGoals[ca] || { gf: 0, ga: 0 }; koGoals[ca].gf += sa; koGoals[ca].ga += sb; }
          if (cb) { koGoals[cb] = koGoals[cb] || { gf: 0, ga: 0 }; koGoals[cb].gf += sb; koGoals[cb].ga += sa; }
        }
        const w = cs.find((x) => x.winner === true);
        const wc = w ? resolveCode(w.team) : null;
        if (round === "FINAL" && wc) finalWinner = wc;
        if (round === "THIRD" && wc) thirdWinner = wc;
      }
    }
  }

  const RANK = { R32: 1, R16: 2, QF: 3, SF: 4 };
  const LAB = { 1: "R32", 2: "R16", 3: "QF", 4: "SF" };

  // Real World Cup groups inferred from who plays whom in the group stage
  const grpStats = (code) => {
    let p = 0, gd = 0, gf = 0, pl = 0;
    (groupAcc[code] || []).forEach((m) => { const a = +m.gf, b = +m.ga; pl++; gf += a; gd += a - b; if (a > b) p += 3; else if (a === b) p += 1; });
    return { p, gd, gf, pl };
  };
  const groupMatesOf = (code) => {
    const s = new Set([code]);
    (logs[code] || []).forEach((m) => { if (m.round === "GROUP" && m.oppCode) s.add(m.oppCode); });
    return [...s];
  };
  const groupPosOf = (code) => {
    if (grpStats(code).pl === 0) return 0;
    const members = groupMatesOf(code).map((c) => ({ c, s: grpStats(c) }));
    members.sort((x, y) => y.s.p - x.s.p || y.s.gd - x.s.gd || y.s.gf - x.s.gf);
    return members.findIndex((m) => m.c === code) + 1;
  };

  const out = {};
  Object.keys(TEAMS).forEach((code) => {
    const g = [{ gf: "", ga: "" }, { gf: "", ga: "" }, { gf: "", ga: "" }];
    (groupAcc[code] || []).slice(0, 3).forEach((m, i) => { g[i] = m; });
    let stage = "GROUP";
    const fx = fixtures[code];
    if (fx) {
      if (fx.has("FINAL")) stage = finalWinner === code ? "CHAMPION" : "FINAL";
      else if (fx.has("THIRD")) stage = thirdWinner === code ? "THIRD" : "SF";
      else {
        let mx = 0;
        ["R32", "R16", "QF", "SF"].forEach((r) => { if (fx.has(r) && RANK[r] > mx) mx = RANK[r]; });
        stage = mx ? LAB[mx] : "GROUP";
      }
    }
    const kg = koGoals[code] || { gf: 0, ga: 0 };
    const matches = (logs[code] || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const groupPos = groupPosOf(code);
    const groupComplete = (groupAcc[code] || []).length >= 3;
    const hasUpcoming = matches.some((m) => !m.completed);
    const playedAny = matches.some((m) => m.completed);
    const koMatches = matches.filter((m) => m.round !== "GROUP" && m.completed);
    const lastKO = koMatches.length ? koMatches[koMatches.length - 1] : null;
    const terminal = stage === "CHAMPION" || stage === "FINAL" || stage === "THIRD";
    let alive;
    if (stage === "CHAMPION") alive = false;
    else if (hasUpcoming) alive = true;
    else if (lastKO && lastKO.adv && !terminal) alive = true; // won last KO, next round pending
    else if (stage === "GROUP" && groupComplete && (groupPos === 1 || groupPos === 2)) alive = true;
    else if (!playedAny) alive = true; // tournament not started
    else alive = false;
    const eliminated = stage !== "CHAMPION" && !alive;

    out[code] = { g, stage, koGF: kg.gf, koGA: kg.ga, matches, groupPos, eliminated };
  });
  schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
  schedule.forEach((m, i) => { m.matchNo = i + 1; });
  return { teams: out, schedule };
}

async function syncFromESPN() {
  const res = await fetch(ESPN_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error("ESPN responded " + res.status);
  return parseEvents(await res.json());
}
