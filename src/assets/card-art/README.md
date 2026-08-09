# Card artwork

Filenames are the card name lowercased with punctuation replaced by hyphens -
`fastitocalon-f.jpg`, `t-rexaur.jpg`, `gim47n.jpg`. `lib/cardArt.js` globs this
directory and matches on that name, so adding a card is dropping its file in,
with no import to write.

Everything here is bundled, so only the cards that can actually be shown belong
in it: the two card dropdowns draw from Ma Dincht's pool (levels 1, 2, 4 and 5,
plus Zell) and the Quistis opponent's (levels 2 and 5, plus Quistis). A card
with no file renders no picture, so a missing one is harmless.

Art is rendered into a fixed 219x283 box with `object-fit: cover`, matching the
in-game card proportions.
