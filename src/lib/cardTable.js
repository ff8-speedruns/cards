/**
 * FF8's Triple Triad card table, transcribed from the game data.
 *
 * `urdl` is the card's four ranks reading up/right/down/left, where 10 is
 * displayed in-game as 'A'. Card ids are positional: id === (level - 1) * 11 +
 * (row - 1), which is how the RNG picks a card (it rolls a level, then a row).
 *
 * Generated from FF8-Utilities' CardManipulation/Const.cs rather than typed by
 * hand - all 110 entries were checked against that id/level/row identity.
 */
export const CARDS = [
  { id: 0, urdl: [1, 4, 1, 5], name: 'Geezard', isRare: false },
  { id: 1, urdl: [5, 1, 1, 3], name: 'Funguar', isRare: false },
  { id: 2, urdl: [1, 3, 3, 5], name: 'Bite Bug', isRare: false },
  { id: 3, urdl: [6, 1, 1, 2], name: 'Red Bat', isRare: false },
  { id: 4, urdl: [2, 3, 1, 5], name: 'Blobra', isRare: false },
  { id: 5, urdl: [2, 1, 4, 4], name: 'Gayla', isRare: false },
  { id: 6, urdl: [1, 5, 4, 1], name: 'Gesper', isRare: false },
  { id: 7, urdl: [3, 5, 2, 1], name: 'Fastitocalon-F', isRare: false },
  { id: 8, urdl: [2, 1, 6, 1], name: 'Blood Soul', isRare: false },
  { id: 9, urdl: [4, 2, 4, 3], name: 'Caterchipillar', isRare: false },
  { id: 10, urdl: [2, 1, 2, 6], name: 'Cockatrice', isRare: false },
  { id: 11, urdl: [7, 1, 3, 1], name: 'Grat', isRare: false },
  { id: 12, urdl: [6, 2, 2, 3], name: 'Buel', isRare: false },
  { id: 13, urdl: [5, 3, 3, 4], name: 'Mesmerize', isRare: false },
  { id: 14, urdl: [6, 1, 4, 3], name: 'Glacial Eye', isRare: false },
  { id: 15, urdl: [3, 4, 5, 3], name: 'Belhelmel', isRare: false },
  { id: 16, urdl: [5, 3, 2, 5], name: 'Thrustaevis', isRare: false },
  { id: 17, urdl: [5, 1, 3, 5], name: 'Anacondaur', isRare: false },
  { id: 18, urdl: [5, 2, 5, 2], name: 'Creeps', isRare: false },
  { id: 19, urdl: [4, 4, 5, 2], name: 'Grendel', isRare: false },
  { id: 20, urdl: [3, 2, 1, 7], name: 'Jelleye', isRare: false },
  { id: 21, urdl: [5, 2, 5, 3], name: 'Grand Mantis', isRare: false },
  { id: 22, urdl: [6, 6, 3, 2], name: 'Forbidden', isRare: false },
  { id: 23, urdl: [6, 3, 1, 6], name: 'Armadodo', isRare: false },
  { id: 24, urdl: [3, 5, 5, 5], name: 'Tri-Face', isRare: false },
  { id: 25, urdl: [7, 5, 1, 3], name: 'Fastitocalon', isRare: false },
  { id: 26, urdl: [7, 1, 5, 3], name: 'Snow Lion', isRare: false },
  { id: 27, urdl: [5, 6, 3, 3], name: 'Ochu', isRare: false },
  { id: 28, urdl: [5, 6, 2, 4], name: 'SAM08G', isRare: false },
  { id: 29, urdl: [4, 4, 7, 2], name: 'Death Claw', isRare: false },
  { id: 30, urdl: [6, 2, 6, 3], name: 'Cactuar', isRare: false },
  { id: 31, urdl: [3, 6, 4, 4], name: 'Tonberry', isRare: false },
  { id: 32, urdl: [7, 2, 3, 5], name: 'Abyss Worm', isRare: false },
  { id: 33, urdl: [2, 3, 6, 7], name: 'Turtapod', isRare: false },
  { id: 34, urdl: [6, 5, 4, 5], name: 'Vysage', isRare: false },
  { id: 35, urdl: [4, 6, 2, 7], name: 'T-Rexaur', isRare: false },
  { id: 36, urdl: [2, 7, 6, 3], name: 'Bomb', isRare: false },
  { id: 37, urdl: [1, 6, 4, 7], name: 'Blitz', isRare: false },
  { id: 38, urdl: [7, 3, 1, 6], name: 'Wendigo', isRare: false },
  { id: 39, urdl: [7, 4, 4, 4], name: 'Torama', isRare: false },
  { id: 40, urdl: [3, 7, 3, 6], name: 'Imp', isRare: false },
  { id: 41, urdl: [6, 2, 7, 3], name: 'Blue Dragon', isRare: false },
  { id: 42, urdl: [4, 5, 5, 6], name: 'Adamantoise', isRare: false },
  { id: 43, urdl: [7, 5, 4, 3], name: 'Hexadragon', isRare: false },
  { id: 44, urdl: [6, 5, 6, 5], name: 'Iron Giant', isRare: false },
  { id: 45, urdl: [3, 6, 5, 7], name: 'Behemoth', isRare: false },
  { id: 46, urdl: [7, 6, 5, 3], name: 'Chimera', isRare: false },
  { id: 47, urdl: [3, 10, 2, 1], name: 'PuPu', isRare: false },
  { id: 48, urdl: [6, 2, 6, 7], name: 'Elastoid', isRare: false },
  { id: 49, urdl: [5, 5, 7, 4], name: 'GIM47N', isRare: false },
  { id: 50, urdl: [7, 7, 4, 2], name: 'Malboro', isRare: false },
  { id: 51, urdl: [7, 2, 7, 4], name: 'Ruby Dragon', isRare: false },
  { id: 52, urdl: [5, 3, 7, 6], name: 'Elnoyle', isRare: false },
  { id: 53, urdl: [4, 6, 7, 4], name: 'Tonberry King', isRare: false },
  { id: 54, urdl: [6, 6, 2, 7], name: 'Wedge Biggs', isRare: false },
  { id: 55, urdl: [2, 8, 8, 4], name: 'Fujin Raijin', isRare: false },
  { id: 56, urdl: [7, 8, 3, 4], name: 'Elvoret', isRare: false },
  { id: 57, urdl: [4, 8, 7, 3], name: 'X-ATM092', isRare: false },
  { id: 58, urdl: [7, 2, 8, 5], name: 'Granaldo', isRare: false },
  { id: 59, urdl: [1, 8, 8, 3], name: 'Gerogero', isRare: false },
  { id: 60, urdl: [8, 2, 8, 2], name: 'Iguion', isRare: false },
  { id: 61, urdl: [6, 8, 4, 5], name: 'Abadon', isRare: false },
  { id: 62, urdl: [4, 8, 5, 6], name: 'Trauma', isRare: false },
  { id: 63, urdl: [1, 8, 4, 8], name: 'Oilboyle', isRare: false },
  { id: 64, urdl: [6, 5, 8, 4], name: 'Shumi Tribe', isRare: false },
  { id: 65, urdl: [7, 5, 8, 1], name: 'Krysta', isRare: false },
  { id: 66, urdl: [8, 4, 4, 8], name: 'Propagator', isRare: false },
  { id: 67, urdl: [8, 8, 4, 4], name: 'Jumbo Cactuar', isRare: false },
  { id: 68, urdl: [8, 5, 2, 8], name: 'Tri-Point', isRare: false },
  { id: 69, urdl: [5, 6, 6, 8], name: 'Gargantua', isRare: false },
  { id: 70, urdl: [8, 6, 7, 3], name: 'Mobile Type 8', isRare: false },
  { id: 71, urdl: [8, 3, 5, 8], name: 'Sphinxara', isRare: false },
  { id: 72, urdl: [8, 8, 5, 4], name: 'Tiamat', isRare: false },
  { id: 73, urdl: [5, 7, 8, 5], name: 'BGH251F2', isRare: false },
  { id: 74, urdl: [6, 8, 4, 7], name: 'Red Giant', isRare: false },
  { id: 75, urdl: [1, 8, 7, 7], name: 'Catoblepas', isRare: false },
  { id: 76, urdl: [7, 7, 8, 2], name: 'Ultima Weapon', isRare: false },
  { id: 77, urdl: [4, 4, 8, 9], name: 'Chubby Chocobo', isRare: true },
  { id: 78, urdl: [9, 6, 7, 3], name: 'Angelo', isRare: true },
  { id: 79, urdl: [3, 7, 9, 6], name: 'Gilgamesh', isRare: true },
  { id: 80, urdl: [9, 3, 9, 2], name: 'MiniMog', isRare: true },
  { id: 81, urdl: [9, 4, 8, 4], name: 'Chicobo', isRare: true },
  { id: 82, urdl: [2, 9, 9, 4], name: 'Quezacotl', isRare: true },
  { id: 83, urdl: [6, 7, 4, 9], name: 'Shiva', isRare: true },
  { id: 84, urdl: [9, 6, 2, 8], name: 'Ifrit', isRare: true },
  { id: 85, urdl: [8, 9, 6, 2], name: 'Siren', isRare: true },
  { id: 86, urdl: [5, 1, 9, 9], name: 'Sacred', isRare: true },
  { id: 87, urdl: [9, 5, 2, 9], name: 'Minotaur', isRare: true },
  { id: 88, urdl: [8, 4, 10, 4], name: 'Carbuncle', isRare: true },
  { id: 89, urdl: [5, 10, 8, 3], name: 'Diablos', isRare: true },
  { id: 90, urdl: [7, 10, 1, 7], name: 'Leviathan', isRare: true },
  { id: 91, urdl: [8, 10, 3, 5], name: 'Odin', isRare: true },
  { id: 92, urdl: [10, 1, 7, 7], name: 'Pandemona', isRare: true },
  { id: 93, urdl: [7, 4, 6, 10], name: 'Cerberus', isRare: true },
  { id: 94, urdl: [9, 10, 4, 2], name: 'Alexander', isRare: true },
  { id: 95, urdl: [7, 2, 7, 10], name: 'Phoenix', isRare: true },
  { id: 96, urdl: [10, 8, 2, 6], name: 'Bahamut', isRare: true },
  { id: 97, urdl: [3, 1, 10, 10], name: 'Doomtrain', isRare: true },
  { id: 98, urdl: [4, 4, 9, 10], name: 'Eden', isRare: true },
  { id: 99, urdl: [10, 7, 2, 8], name: 'Ward', isRare: true },
  { id: 100, urdl: [6, 7, 6, 10], name: 'Kiros', isRare: true },
  { id: 101, urdl: [5, 10, 3, 9], name: 'Laguna', isRare: true },
  { id: 102, urdl: [10, 8, 6, 4], name: 'Selphie', isRare: true },
  { id: 103, urdl: [9, 6, 10, 2], name: 'Quistis', isRare: true },
  { id: 104, urdl: [2, 6, 9, 10], name: 'Irvine', isRare: true },
  { id: 105, urdl: [8, 5, 10, 6], name: 'Zell', isRare: true },
  { id: 106, urdl: [4, 10, 2, 10], name: 'Rinoa', isRare: true },
  { id: 107, urdl: [10, 10, 3, 3], name: 'Edea', isRare: true },
  { id: 108, urdl: [6, 9, 10, 4], name: 'Seifer', isRare: true },
  { id: 109, urdl: [10, 4, 6, 9], name: 'Squall', isRare: true },
];

export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

/**
 * A card's ranks as runners quote them and the Windows tool reads them: top,
 * left, right, down, with 10 as 'A'.
 *
 * A re-order, not a join - storage here is `urdl`, the order the game data uses.
 */
export const cardRanks = (card) => {
  const [up, right, down, left] = card.urdl;
  return [up, left, right, down].map((rank) => (rank === 10 ? 'A' : String(rank))).join('');
};

/** Rank text in comparable form: ranks parse as hex with 0 meaning 10, so "865A" and "8650" are the same card. */
export const normaliseRanks = (text) => text.toLowerCase().replace(/0/g, 'a');

/** PuPu can never appear in a drawn deck; the game skips it. */
export const PUPU_ID = 47;

export const QUISTIS_ID = 103;
export const ZELL_ID = 105;
