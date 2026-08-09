/**
 * Local persistence for uploaded strats and in-progress counts.
 *
 * Nothing leaves the browser. Uploaded files are kept so they're still in the
 * dropdown next time, and a run's answers are kept so an accidental refresh
 * doesn't lose the count.
 */

const STRATS_KEY = 'ff8-cards-uploaded-strats';
const SESSION_KEY = 'ff8-cards-session';

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // Corrupt or unavailable storage shouldn't take the tool down with it.
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/** Uploaded strats, as `{ id, name, data }`. */
export const loadUploadedStrats = () => {
  const stored = read(STRATS_KEY, []);
  return Array.isArray(stored) ? stored.filter((entry) => entry && entry.id && entry.data) : [];
};

export function saveUploadedStrat(entry) {
  const existing = loadUploadedStrats().filter((strat) => strat.id !== entry.id);
  const next = [...existing, entry];
  return write(STRATS_KEY, next) ? next : existing;
}

export function deleteUploadedStrat(id) {
  const next = loadUploadedStrats().filter((strat) => strat.id !== id);
  write(STRATS_KEY, next);
  return next;
}

/** The selections and options for whichever strat was last open. */
export const loadSession = () => read(SESSION_KEY, null);

export const saveSession = (session) => write(SESSION_KEY, session);
