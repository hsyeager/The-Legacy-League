const { useState, useEffect, useMemo } = React;


/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const TEAMS = {
  // Tier 1 — Elite Favourites
  ES:  { name: "Spain",          flag: "🇪🇸", tier: 1 },
  BE:  { name: "Belgium",        flag: "🇧🇪", tier: 1 },
  FR:  { name: "France",         flag: "🇫🇷", tier: 1 },
  AR:  { name: "Argentina",      flag: "🇦🇷", tier: 1 },
  ENG: { name: "England",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1 },
  PT:  { name: "Portugal",       flag: "🇵🇹", tier: 1 },
  NO:  { name: "Norway",         flag: "🇳🇴", tier: 1 },
  BR:  { name: "Brazil",         flag: "🇧🇷", tier: 1 },
  DE:  { name: "Germany",        flag: "🇩🇪", tier: 1 },
  CO:  { name: "Colombia",       flag: "🇨🇴", tier: 1 },
  NL:  { name: "Netherlands",    flag: "🇳🇱", tier: 1 },
  MA:  { name: "Morocco",        flag: "🇲🇦", tier: 1 },
  // Tier 2 — Contenders
  JP:  { name: "Japan",          flag: "🇯🇵", tier: 2 },
  CH:  { name: "Switzerland",    flag: "🇨🇭", tier: 2 },
  HR:  { name: "Croatia",        flag: "🇭🇷", tier: 2 },
  EC:  { name: "Ecuador",        flag: "🇪🇨", tier: 2 },
  MX:  { name: "Mexico",         flag: "🇲🇽", tier: 2 },
  UY:  { name: "Uruguay",        flag: "🇺🇾", tier: 2 },
  AT:  { name: "Austria",        flag: "🇦🇹", tier: 2 },
  US:  { name: "USA",            flag: "🇺🇸", tier: 2 },
  SWE: { name: "Sweden",         flag: "🇸🇪", tier: 2 },
  SN:  { name: "Senegal",        flag: "🇸🇳", tier: 2 },
  SCO: { name: "Scotland",       flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", tier: 2 },
  TR:  { name: "Turkey",         flag: "🇹🇷", tier: 2 },
  // Tier 3 — Dark Horses
  KR:  { name: "South Korea",    flag: "🇰🇷", tier: 3 },
  CA:  { name: "Canada",         flag: "🇨🇦", tier: 3 },
  AU:  { name: "Australia",      flag: "🇦🇺", tier: 3 },
  BIH: { name: "Bosnia",         flag: "🇧🇦", tier: 3 },
  EG:  { name: "Egypt",          flag: "🇪🇬", tier: 3 },
  CIV: { name: "Ivory Coast",    flag: "🇨🇮", tier: 3 },
  GH:  { name: "Ghana",          flag: "🇬🇭", tier: 3 },
  IRN: { name: "Iran",           flag: "🇮🇷", tier: 3 },
  DZ:  { name: "Algeria",        flag: "🇩🇿", tier: 3 },
  CZE: { name: "Czech Republic", flag: "🇨🇿", tier: 3 },
  PAR: { name: "Paraguay",       flag: "🇵🇾", tier: 3 },
  TN:  { name: "Tunisia",        flag: "🇹🇳", tier: 3 },
  // Tier 4 — Long Shots
  COD: { name: "DR Congo",       flag: "🇨🇩", tier: 4 },
  PAN: { name: "Panama",         flag: "🇵🇦", tier: 4 },
  IRQ: { name: "Iraq",           flag: "🇮🇶", tier: 4 },
  JOR: { name: "Jordan",         flag: "🇯🇴", tier: 4 },
  UZB: { name: "Uzbekistan",     flag: "🇺🇿", tier: 4 },
  QA:  { name: "Qatar",          flag: "🇶🇦", tier: 4 },
  RSA: { name: "South Africa",   flag: "🇿🇦", tier: 4 },
  HAI: { name: "Haiti",          flag: "🇭🇹", tier: 4 },
  CPV: { name: "Cape Verde",     flag: "🇨🇻", tier: 4 },
  NZ:  { name: "New Zealand",    flag: "🇳🇿", tier: 4 },
  CUW: { name: "Curacao",        flag: "🇨🇼", tier: 4 },
  KSA: { name: "Saudi Arabia",   flag: "🇸🇦", tier: 4 },
};

// Each manager (shown as "Group N") owns one team per tier.
const SQUADS = [
  ["ES", "TR", "CIV", "CUW"],   // 1, 24, 25, 48
  ["FR", "SCO", "KR", "HAI"],   // 2, 23, 26, 47
  ["AR", "SWE", "EG", "NZ"],    // 3, 22, 27, 46
  ["ENG", "AT", "CA", "KSA"],   // 4, 21, 28, 45
  ["BR", "EC", "DZ", "PAN"],    // 5, 20, 29, 44
  ["PT", "CH", "AU", "CPV"],    // 6, 19, 30, 43
  ["DE", "SN", "GH", "IRQ"],    // 7, 18, 31, 42
  ["NL", "JP", "PAR", "JOR"],   // 8, 17, 32, 41
  ["BE", "MX", "IRN", "QA"],    // 9, 16, 33, 40
  ["NO", "US", "CZE", "UZB"],   // 10, 15, 34, 39
  ["CO", "HR", "BIH", "COD"],   // 11, 14, 35, 38
  ["MA", "UY", "TN", "RSA"],    // 12, 13, 36, 37
];

// Three managers per group — one in each parallel league. Index matches SQUADS.
const MANAGERS = [
  { gold: "Garrett Schreffler",            silver: "Eiseman / Schneider",         bronze: "Jake Calamari" },
  { gold: "Max Walker",                    silver: "Sam Naim",                    bronze: "Jake Price" },
  { gold: "Cole Miller",                   silver: "Sullivan / Biersack",         bronze: "Ethan Core" },
  { gold: "Harrison Yeager",               silver: "Nick Moeller",                bronze: "Brian Damp" },
  { gold: "Schmidt / Nielsen / Churney",   silver: "Daniel Hamerschlag",          bronze: "Connor Dyball" },
  { gold: "Andrew Kowal",                  silver: "Joe Moeller",                 bronze: "Andrew Guckes" },
  { gold: "Steinberger / Nusim",           silver: "Danny Chryst",                bronze: "Grant Hevia" },
  { gold: "Chapman / Perlstein",           silver: "Du / Kiskinis / Shapiro",     bronze: "Joe De Lia" },
  { gold: "Richard Antwi",                 silver: "Aidan Pierce",                bronze: "Ben Raffel" },
  { gold: "Dylan Emert",                   silver: "Elias Baldino",               bronze: "Drew Munger" },
  { gold: "Eddie Dunn",                    silver: "Tomas Montenegro",            bronze: "Mitch Schuster" },
  { gold: "David Berman",                  silver: "JD Danielson",                bronze: "Dylan Friendly" },
];

// Map team code -> squad index, so we can look up which managers own a given team.
const TEAM_SQUAD = {};
SQUADS.forEach((squad, i) => squad.forEach((code) => { TEAM_SQUAD[code] = i; }));

const DIVISIONS = [
  { key: "gold",   label: "Premier League", color: "#f6d87c", dim: "#d4af37" },
  { key: "silver", label: "Undertakers",    color: "#cdd5e0", dim: "#9aa6b8" },
  { key: "bronze", label: "Bottom Feeders", color: "#d99a5b", dim: "#b87333" },
];
const DIV_COLOR = { gold: "#f6d87c", silver: "#cdd5e0", bronze: "#d99a5b" };

const TIER_META = {
  1: { name: "Elite Favourites", odds: "+450 to +5000",      color: "#d4af37", bg: "rgba(212,175,55,0.10)" },
  2: { name: "Contenders",       odds: "+5500 to +20000",    color: "#9aa6b8", bg: "rgba(154,166,184,0.10)" },
  3: { name: "Dark Horses",      odds: "+20000 to +70000",   color: "#3fd68a", bg: "rgba(63,214,138,0.12)" },
  4: { name: "Long Shots",       odds: "+100000+",           color: "#e15b73", bg: "rgba(225,91,115,0.12)" },
};

// Furthest stage / placement options
const STAGES = [
  { key: "GROUP",    label: "Out — group stage" },
  { key: "R32",      label: "Round of 32" },
  { key: "R16",      label: "Round of 16" },
  { key: "QF",       label: "Quarter-final" },
  { key: "SF",       label: "Semi-final (4th)" },
  { key: "THIRD",    label: "3rd place" },
  { key: "FINAL",    label: "Runner-up" },
  { key: "CHAMPION", label: "Champion 🏆" },
];

// Cumulative round bonuses for reaching a stage (R32 has none — folded into the +3 for reaching the knockouts)
const ROUND_BONUS = {
  GROUP: 0,
  R32: 0,
  R16: 2,
  QF: 2 + 4,
  SF: 2 + 4 + 6,
  THIRD: 2 + 4 + 6,
  FINAL: 2 + 4 + 6 + 8,
  CHAMPION: 2 + 4 + 6 + 8,
};

// Knockout wins implied by furthest stage
const KO_WINS = {
  GROUP: 0, R32: 0, R16: 1, QF: 2, SF: 3, THIRD: 4, FINAL: 4, CHAMPION: 5,
};

// Win value by tier — top half of the field (1–2) pays 3, underdog half (3–4) pays 5.
const WIN_PTS = { 1: 3, 2: 3, 3: 5, 4: 5 };

// Breadth: each team that reaches the knockouts (R32) earns the manager points.
const REACH_KO_BONUS = 3;

const PLACEMENT_BONUS = { CHAMPION: 8, FINAL: 4, THIRD: 2 };

const ROUND_LABEL = { GROUP: "Group", R32: "Round of 32", R16: "Round of 16", QF: "Quarter-final", SF: "Semi-final", THIRD: "3rd-Place", FINAL: "Final" };
const STAGE_DESC = { GROUP: "Group stage", R32: "Round of 32", R16: "Round of 16", QF: "Quarter-finals", SF: "Semi-finals", THIRD: "3rd place 🥉", FINAL: "Runner-up 🥈", CHAMPION: "Champion 🏆" };
const REACHED_LABEL = { R32: "Reached R32", R16: "Reached R16", QF: "Reached QF", SF: "Reached SF", THIRD: "3rd place 🥉", FINAL: "Reached Final", CHAMPION: "Champion 🏆" };
const ordinal = (n) => (["", "1st", "2nd", "3rd", "4th"][n] || (n + "th"));
function statusOf(r) {
  if (!r) return { label: "", elim: false, gold: false };
  if (r.stage === "CHAMPION") return { label: "Champion 🏆", elim: false, gold: true };
  if (r.stage && r.stage !== "GROUP") return { label: REACHED_LABEL[r.stage] || r.stage, elim: !!r.eliminated, gold: false };
  if (r.groupPos) return { label: ordinal(r.groupPos) + " in group", elim: !!r.eliminated, gold: false };
  return { label: "Group stage", elim: false, gold: false };
}
