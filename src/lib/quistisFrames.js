/**
 * Names Quistis frames the way runners recognise them: by the first two non-rare
 * cards in the opponent's deck, written "Elastoid (Grendel)". The Quistis card is
 * on every winnable frame, so naming it would identify nothing.
 *
 * At a count of 0 this reproduces the seven established Early Quistis names; the
 * same rule then names Late Quistis frames, whose decks differ at every count.
 */
import { advance, drawDeck, rareFrames, FORCED_INCR, PLAYERS } from './cardRng';
import { CARD_BY_ID, QUISTIS_ID } from './cardTable';
import { quistisResultState, winnableFrames } from '../data/quistisResults';

const cardName = (cardId) => CARD_BY_ID.get(cardId)?.name ?? `#${cardId}`;

const name = (cards) => (cards.length > 1 ? `${cardName(cards[0])} (${cards.slice(1).map(cardName).join(', ')})` : cardName(cards[0]));

/**
 * Every frame the card can be won on at this count: the deck it shows, a name,
 * and the RNG state it leaves for the Zell battle.
 *
 * Frame N is the Nth frame the rare is available on, not frame offset N.
 */
export function quistisFrameOptions(count) {
  const frames = winnableFrames(count);
  if (frames.length === 0) return [];

  const state = advance(1, count);
  const available = rareFrames(state, PLAYERS.fc01).flatMap((hit, offset) => (hit ? [offset] : []));

  const decks = frames.map((frame) => {
    const offset = available[frame - 1];
    const deck = offset === undefined ? [] : drawDeck(state + FORCED_INCR + offset, PLAYERS.fc01).deck;
    return { frame, deck, others: deck.filter((cardId) => cardId !== QUISTIS_ID) };
  });

  // Two frames occasionally open on the same pair, so those names take a third
  // card. Everything else stays short.
  const pairs = decks.map(({ others }) => others.slice(0, 2).join(','));
  const shared = new Set(pairs.filter((pair, i) => pairs.indexOf(pair) !== i));

  return decks.map(({ frame, deck, others }, i) => {
    // The cards the label is built from, so a caller can show their artwork
    // beside it without re-deriving which ones ended up naming the frame.
    const tellIds = others.slice(0, shared.has(pairs[i]) ? 3 : 2);
    return {
      frame,
      state: quistisResultState(count, frame),
      label: name(tellIds),
      tellIds,
      deckNames: deck.map(cardName),
    };
  });
}
