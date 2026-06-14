/* ------------------------------------------------------------------ */
/*  PERSISTENCE                                                        */
/* ------------------------------------------------------------------ */

const STORE_KEY = "legacy-league-v1";

async function loadData() {
  try {
    const r = localStorage.getItem(STORE_KEY);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return null;
}
async function saveData(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (e) {}
}
