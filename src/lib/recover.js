/**
 * Second Try Zell: work out where the RNG actually was from the hand Ma Dincht
 * showed, so a missed attempt sets up an exact second one.
 *
 * Playing a game moves no card RNG (verified on hardware): only the play/quit
 * prompt advances it, one per frame, plus the twelve LCG steps of the deck draw
 * at the accept input. So a game ends on its own draw state, and the hand you
 * saw determines the next challenge exactly.
 *
 * A hand alone can't locate you: five ordered cards plus the initiative bit
 * distinguish fewer possibilities than the 2^32 state space, leaving roughly
 * nineteen candidates. The search is anchored near the tracked count instead.
 * It walks candidate counts rather than a numeric window because a miscount
 * scatters the state unpredictably, while a mistimed mash only shifts the frame.
 */
import { advance, drawDeck, solve, FORCED_INCR, PLAYERS } from './cardRng';
import { PUPU_ID } from './cardTable';

const POW32 = 0x100000000;

/** Counts either side of the tracked one to try. Shown in the UI when nothing matches. */
export const COUNT_RADIUS = 150;

/** Frames searched within each count. */
const MAX_FRAME = 600;

/** Every card an opponent can hold: their card levels, minus PuPu, plus their rare. */
export function opponentPool(player) {
  const ids = player.levels.flatMap((level) => Array.from({ length: 11 }, (_, row) => (level - 1) * 11 + row));
  return [...ids, ...player.rares].filter((id) => id !== PUPU_ID);
}

const sortedKey = (cardIds) => [...cardIds].sort((a, b) => a - b).join(',');

/**
 * Every (count, frame) within the search range whose deck matches `observed`.
 *
 * Exact draw order is what the game displays, so that's matched first. Only if
 * nothing matches in order does it fall back to matching as a set, which is
 * much less specific but rescues a misread hand; `orderMatched` says which
 * happened.
 */
export function recoverAttempts(seed, observed, { player = PLAYERS.zellmama, countCentre = 0, playerGoesFirst = null } = {}) {
  const wantOrdered = observed.join(',');
  const wantSet = sortedKey(observed);
  const from = Math.max(0, countCentre - COUNT_RADIUS);
  const to = countCentre + COUNT_RADIUS;

  const inOrder = [];
  const anyOrder = [];
  let state = advance(seed, from);

  for (let count = from; count <= to; count++) {
    for (let frame = 0; frame <= MAX_FRAME; frame++) {
      const drawState = (state + FORCED_INCR + frame) % POW32;
      const drawn = drawDeck(drawState, player);
      if (playerGoesFirst !== null && drawn.playerGoesFirst !== playerGoesFirst) continue;

      const key = drawn.deck.join(',');
      if (key !== wantOrdered && sortedKey(drawn.deck) !== wantSet) continue;

      const candidate = {
        count,
        frame,
        drawState,
        // The state the game ends on, and so the state the next challenge starts
        // from, because playing it out consumes nothing.
        postState: drawn.lastState,
        deck: drawn.deck,
        playerGoesFirst: drawn.playerGoesFirst,
      };
      (key === wantOrdered ? inOrder : anyOrder).push(candidate);
    }
    state = advance(state, 1);
  }

  return inOrder.length > 0
    ? { candidates: inOrder, orderMatched: true }
    : { candidates: anyOrder, orderMatched: false };
}

/**
 * What to do on the next challenge from a recovered candidate. Count 0 because
 * the state is already known outright, with nothing left to accumulate.
 */
export const nextAttempt = (candidate, player = PLAYERS.zellmama) => solve(candidate.postState, 0, player);
