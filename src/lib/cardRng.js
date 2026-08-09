/**
 * The card-game RNG, ported from FF8-Utilities' CardManipulation/CardManip.cs.
 *
 * A different generator from the field RNG the other tools use: the state
 * advances as `state * 0x10dcd + 1` (mod 2^32) and each draw takes the top bits.
 * See the README for how this was checked against the reference tables.
 */
import { PUPU_ID, QUISTIS_ID, ZELL_ID } from './cardTable';

const POW32 = 0x100000000;

// `state * 0x10dcd + 1` peaks near 2.97e14, inside the range where doubles are
// still exact, so no BigInt is needed.
const step = (state) => (state * 0x10dcd + 1) % POW32;

const draw = (state) => Math.floor(step(state) / 0x20000); // (state * a + 1) >>> 17

/** The state after `steps` advances from `seed`. A fresh battle starts at 1. */
export function advance(seed, steps) {
  let state = seed % POW32;
  for (let i = 0; i < steps; i++) state = step(state);
  return state;
}

/** The opponents worth manipulating, with the card levels they draw from. */
export const PLAYERS = {
  /** Late Quistis opponent. `rareLimit` is their percentage chance of holding it. */
  fc01: { name: 'Trepe Groupie #1', rares: [QUISTIS_ID], rareLimit: 30, levels: [2, 5] },
  zellmama: { name: 'Ma Dincht', rares: [ZELL_ID], rareLimit: 10, levels: [1, 2, 4, 5] },
};

/**
 * Frames the game forces past the accept input before the deck is locked in.
 *
 * Both platforms clamp to this same value with no time on the clock, so the
 * frame tables and decks below are platform-independent. Real elapsed time is
 * not - see `DELAY_FRAME` and `liveFrameIndex`.
 */
export const FORCED_INCR = 10;

const TABLE_WIDTH = 600;
const DECK_SIZE = 5;

/** The game's frame rate, and so the rate the card RNG ticks at on the prompt. */
export const TICK_HZ = 60;

/**
 * How long the screen transition after accepting runs before the confirm menu
 * is actually live, in ticks. This is the one place the platform matters.
 * Ported from FF8-Utilities' `Options.DelayFrame`.
 */
export const DELAY_FRAME = { pc: 69, ps2: 285 };

/** Extra ticks needed once past the transition before a confirm can register - same on both platforms. */
const ACCEPT_DELAY_FRAME = 3;

/** The lowest frame index a live wait can actually land on once past the transition - 1, 2, 3 never occur. */
const FIRST_REACHABLE_PAST_TRANSITION = ACCEPT_DELAY_FRAME + 1;

/**
 * The frame index confirming right now would land on, `elapsedSeconds` after
 * accepting. Ported from FF8-Utilities' `GetRareTimerStep`.
 *
 * Frame 0 is reachable any time during the transition, after which the index
 * jumps to `ACCEPT_DELAY_FRAME` ticks past it. Frames 1-3 are unreachable.
 */
export function liveFrameIndex(elapsedSeconds, platform = 'pc') {
  const incrStart = (DELAY_FRAME[platform] - FORCED_INCR) / TICK_HZ;
  const floor = FORCED_INCR + ACCEPT_DELAY_FRAME;
  let incr = Math.max(Math.round((elapsedSeconds - incrStart) * TICK_HZ), floor);
  if (incr <= floor) incr = FORCED_INCR;
  return incr - FORCED_INCR;
}

/**
 * Real seconds after accepting until confirming first lands on `index`.
 * Unreachable indices 1-3 resolve to index 4's time; a window starting there
 * always extends past it.
 */
export function secondsUntilFrame(index, platform = 'pc') {
  if (index <= 0) return 0;
  const effective = Math.max(index, FIRST_REACHABLE_PAST_TRANSITION);
  return (DELAY_FRAME[platform] + effective) / TICK_HZ;
}

/** For each of the next frames, whether the rare card would be in their deck. */
export function rareFrames(state, player) {
  const frames = new Array(TABLE_WIDTH);
  for (let i = 0; i < TABLE_WIDTH; i++) frames[i] = draw(state + FORCED_INCR + i) % 100 < player.rareLimit;
  return frames;
}

/**
 * The first frame worth mashing on: the earliest that begins a run of four, so a
 * slightly late input still lands. Falls back to the last lone hit, matching the
 * reference so the numbers agree with published tables.
 */
function firstAvailableFrame(frames) {
  let first = 0;
  for (let i = 0; i < frames.length; i++) {
    if (!frames[i]) continue;
    first = i;
    if (frames[i + 1] && frames[i + 2] && frames[i + 3]) break;
  }
  return first;
}

/**
 * The deck drawn at a state, and who moves first.
 *
 * The rare gets its own roll first (at half odds if the deck already has one),
 * then the rest come from rolling a level and a row, rejecting PuPu and repeats.
 */
export function drawDeck(state, player) {
  let rng = state % POW32;
  const next = () => {
    rng = step(rng);
    return Math.floor(rng / 0x20000);
  };

  const deck = [];
  for (const rareId of player.rares) {
    const limit = deck.length === 0 ? player.rareLimit : Math.floor(player.rareLimit / 2);
    if (next() % 100 < limit) deck.push(rareId);
  }

  // Capped: reject-and-retry has no proven termination bound, and a short deck
  // beats a hung render.
  for (let attempts = 0; deck.length < DECK_SIZE && attempts < 10000; attempts++) {
    const level = player.levels[next() % player.levels.length];
    const cardId = (level - 1) * 11 + (next() % 11);
    if (cardId !== PUPU_ID && !deck.includes(cardId)) deck.push(cardId);
  }

  return { deck, playerGoesFirst: (next() & 1) !== 0, lastState: rng };
}

/** How many frames the rare stays available from `frame`. */
const windowFrom = (frames, frame) => {
  let length = 0;
  while (frames[frame + length]) length++;
  return length;
};

/**
 * What to tell the runner for a given count. `seed` is the state going into the
 * battle - 1 from a fresh file, or whatever the Quistis game left behind.
 */
export function solve(seed, count, player) {
  const state = advance(seed, count);
  const frames = rareFrames(state, player);
  const frame = firstAvailableFrame(frames);

  return {
    state,
    frames,
    frame,
    window: windowFrom(frames, frame),
    deck: drawDeck(state + FORCED_INCR + frame, player),
  };
}
