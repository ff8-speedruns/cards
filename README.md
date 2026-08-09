# Card RNG Manip Tool

Tracks early-game RNG so you can line up the Quistis and Zell card
manipulations. Pick your route, log what happens in each fight, and the tool
tells you the RNG count and whether to mash immediately or how long to wait.

**Needs testing in real runs.** The maths checks out against the reference
tools (see below) but nobody has used it in anger yet.

[Access the live tool](https://tools.ff8.wiki/cards)

[All tools](https://tools.ff8.wiki)

## Routes

The default **Standard route** needs no file at all. It's modelled encounter by
encounter - the way FF8-Utilities does it - so route variations are switches
rather than separate files: which fight you got in the cavern, whether the bridge
or red soldier fights happened, how many world map encounters and Fish Fins
fights you ran into.

Eleven prewritten routes also ship with the tool, taken from Card_Manip's bundled
strats, and you can upload your own. Uploads are kept in your browser's local
storage and never leave your machine.

Three file shapes are accepted: Card_Manip's original format, a shorter format of
our own, and that shorter format with `toggles` for branching. The "Writing your
own strat file" section in the tool documents both of ours.

## The Quistis card affects the Zell numbers

The Zell manipulation starts from the RNG state the Quistis card game *ended* on,
and that depends on which frame you won it. The state can't be calculated -
playing the game out consumes RNG according to how it was played - so it comes
from a published table (`src/data/quistisResults.js`, 232 rows). Row 0 matches
FF8-Utilities' hardcoded `EarlyQuistisPattern` results exactly, and row 130
frame 4 matches the seed in their `TestLQ130Frame4Zell241` test.

You don't pick a frame number, because nobody remembers winning on "frame 4" -
you pick the deck the opponent had. Frames are named by their first two cards,
the established notation, so frame 4 reads **Elastoid (Grendel)**. That naming is
just "the first two non-rare cards in the deck", which is computed rather than
hardcoded, so it works at every count; it's unambiguous at all 232 covered counts
(seven of them need a third card added, which the code does automatically).

The two manipulations aren't only a matter of timing:

| | Zell seeds from | Zell count |
| --- | --- | --- |
| **Early** - won before the tracked encounters | one of seven fixed states | Quistis + Zell |
| **Late** - won partway through | the table, at the count reached | Zell only |

Late Quistis coverage is RNG count 120–350. Outside that the tool says the Zell
result is unknown rather than guessing.

**Early is pinned to a counter of 0.** That follows FF8-Utilities, which hardcodes
those seven states, but it hasn't been confirmed against a route that takes the
card after some RNG has already been spent (a Fish Fin farm, say). The tool says
so on screen rather than assuming quietly.

## Why there's no version selector

PSX and PC 2013 differ in one value the reference calls `DelayFrame` - 285 versus
69. With no time on the clock both clamp to the same increment of 10, so every
result this tool produces is identical on both: checked across counts 0–350 for
both opponents, all 802 comparisons equal.

That stops being true the moment a live timer is involved. From roughly 1.5s in,
the two diverge sharply (at 3s: 10 versus 121). **Anyone adding the second-game or
recovery timer has to make the platform an explicit input at that point.**

## Known gaps

The tool covers the counter and the first-game answer. It does not model:

- Turbo rate, and therefore which frames are actually reachable (only the first
  two or three are, in practice).
- Your own five cards. The Luzbelheim set wins frames 1–2, the Pingval set all
  three, so a frame the tool offers may be one you can't win with your deck.
- The play sequence. Card_Manip's "How to Play" sheet has it, unported; card order
  affects the opponent AI, so a frame alone is an incomplete answer.
- Second-game / fallback solutions.
- The confirm cue as an asterisk position, which is what runners actually watch -
  results are given in frames and seconds instead.

## How the numbers are worked out

`src/lib/cardRng.js` is a port of FF8-Utilities' `CardManipulation/CardManip.cs`
- a separate generator from the field RNG the other tools use, advancing as
`state * 0x10dcd + 1` and drawing from the top bits.

It was checked against Card_Manip's "Q card Late" reference spreadsheets:

| Check | Result |
| --- | --- |
| Published RNG states reproduced from a seed of 1 | 241 / 241 |
| First available frame | 220 / 222 |
| Opponent deck at the computed frame | 222 / 222 |

The two frame outliers are stale cells in that hand-maintained sheet, not a
difference in logic - for both rows the sheet's own deck data matches the deck at
the computed frame rather than at its stated one, and the next closest `incr`
value scores 64/222, so the algorithm is pinned.

## Acknowledgements
This tool was made possible by the following people's dedicated research:
- [Pingval](https://github.com/pingval/Speedrun/blob/master/FF8/ff8_zellmama_en.rb)
- [Kaivel](https://www.twitch.tv/kaivel)
- [Kiitoksia](https://twitch.tv/Kiitoksia)

## Development

Vite + React + Mantine. Shared theme, header and app shell come from
[@ff8-speedruns/ui](https://github.com/ff8-speedruns/ff8-ui), installed straight
from git - there is no npm registry involved.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run lint
```

Pushing to `main` builds and deploys to the `gh-pages` branch automatically.

To try a change to the shared UI before tagging it, point this repo at your
working copy with `npm install ../ff8-ui`, and put the `github:` line in
`package.json` back before committing.
