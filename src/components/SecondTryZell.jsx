import { useRef, useState } from 'react';
import { Accordion, Alert, Badge, Button, Group, List, SegmentedControl, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { CARD_BY_ID, cardRanks, normaliseRanks } from '../lib/cardTable';
import { PLAYERS } from '../lib/cardRng';
import { nextAttempt, opponentPool, recoverAttempts, COUNT_RADIUS } from '../lib/recover';
import { signed } from '../lib/format';
import CardImage from './CardImage';
import MashResult from './MashResult';

const SLOTS = [0, 1, 2, 3, 4];

const CARD_OPTIONS = opponentPool(PLAYERS.zellmama)
  .map((id) => ({ value: String(id), label: CARD_BY_ID.get(id).name }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Match on card name or on ranks, so the names aren't required knowledge.
 *
 * Ranks match as a prefix, the way they're read off the card face: "6" is every
 * card with a top of 6, "67" adds a left of 7. Names stay a substring match and
 * the two are OR'd, so a digit can hit either.
 */
const filterCards = ({ options, search }) => {
  const query = search.trim().toLowerCase();
  if (!query) return options;

  const ranks = normaliseRanks(query);
  return options.filter((option) => {
    if (option.label.toLowerCase().includes(query)) return true;
    const card = CARD_BY_ID.get(Number(option.value));
    return card ? normaliseRanks(cardRanks(card)).startsWith(ranks) : false;
  });
};

/**
 * Recovers the RNG state from the hand Ma Dincht showed, so a missed attempt
 * sets up an exact second one. The hand overrides the tracked count, so this
 * works even when the count was wrong.
 *
 * The search is a button rather than live: it tries every count within
 * `COUNT_RADIUS` against 600 frames each, around a seventh of a second. Its
 * inputs live here rather than in the session - they describe one attempt.
 */
export default function SecondTryZell({ seed, count, expectedFrame, platform }) {
  const [cards, setCards] = useState([null, null, null, null, null]);
  const [firstMove, setFirstMove] = useState('either');
  const [found, setFound] = useState(null);
  const inputRefs = useRef([]);

  const chosen = cards.filter((card) => card !== null);
  const ready = chosen.length === SLOTS.length;

  const setCard = (slot, value) => {
    setCards((current) => current.map((card, i) => (i === slot ? value : card)));
    setFound(null);
  };

  /** Options still open to a slot: everything bar the cards taken by other slots. */
  const optionsFor = (slot) =>
    CARD_OPTIONS.filter((option) => option.value === cards[slot] || !cards.includes(option.value));

  /**
   * Hand off to the next slot so five cards can be entered without the mouse.
   *
   * Deferred a frame because Mantine finishes its commit after this callback,
   * and focus moved mid-flight gets pulled back. Focusing a searchable Select
   * opens its dropdown, so the next slot is ready to type into.
   */
  const advanceFrom = (slot) => {
    const next = slot + 1;
    if (next >= SLOTS.length) return;
    requestAnimationFrame(() => inputRefs.current[next]?.focus());
  };

  const search = () =>
    setFound(
      recoverAttempts(seed, cards.map(Number), {
        countCentre: count,
        playerGoesFirst: firstMove === 'either' ? null : firstMove === 'you',
      })
    );

  const only = found?.candidates.length === 1 ? found.candidates[0] : null;

  return (
    // Closed by default: only relevant once an attempt has already missed.
    <Accordion variant="contained">
      <Accordion.Item value="second-try">
        <Accordion.Control>Second Try Zell</Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">
            <Text size="xs" c="dimmed">
              If the first attempt missed, enter the five cards Ma Dincht had. Playing the game out doesn&apos;t move
              the card RNG, so her hand says exactly where you are and the next attempt can be timed rather than
              guessed.
            </Text>

            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xs">
              {SLOTS.map((slot) => (
                <Select
                  key={slot}
                  // Block body: React 19 treats a ref callback's return as cleanup.
                  ref={(element) => {
                    inputRefs.current[slot] = element;
                  }}
                  label={`Card ${slot + 1}`}
                  placeholder="Pick"
                  // Her hand can't repeat a card, so a card taken elsewhere drops out.
                  data={optionsFor(slot)}
                  value={cards[slot]}
                  onChange={(value) => setCard(slot, value)}
                  onOptionSubmit={(value) => {
                    // Re-submitting the chosen option deselects it, which isn't progress.
                    if (value !== cards[slot]) advanceFrom(slot);
                  }}
                  renderOption={({ option }) => {
                    const card = CARD_BY_ID.get(Number(option.value));
                    return (
                      <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                        <CardImage card={card} />
                        <span>{option.label}</span>
                        {card && (
                          <Text size="xs" c="dimmed" ff="monospace" ml="auto">
                            {cardRanks(card)}
                          </Text>
                        )}
                      </Group>
                    );
                  }}
                  searchable
                  filter={filterCards}
                  // Highlights the top match as you type, so Enter commits it.
                  selectFirstOptionOnChange
                  clearable
                  maxDropdownHeight={260}
                />
              ))}
            </SimpleGrid>

            <Group align="flex-end" gap="md">
              <Stack gap={4}>
                <Text size="sm">Who moved first?</Text>
                <SegmentedControl
                  value={firstMove}
                  onChange={(value) => {
                    setFirstMove(value);
                    setFound(null);
                  }}
                  data={[
                    { value: 'either', label: "Don't recall" },
                    { value: 'you', label: 'You' },
                    { value: 'them', label: 'Ma Dincht' },
                  ]}
                />
              </Stack>
              <Button onClick={search} disabled={!ready}>
                Find the state
              </Button>
            </Group>

            <Text size="xs" c="dimmed">
              In draw order, top to bottom as the game showed them. Order isn&apos;t essential but it narrows the answer
              a long way, and saying who moved first halves what&apos;s left. Search by name, or type the ranks the way
              the Windows tool writes them &mdash; top, left, right, down, with 10 as A or 0, so Zell is 865A.
            </Text>

            {found?.candidates.length === 0 && (
              <Alert icon={<IconAlertTriangle />} color="red" variant="light" title="No match">
                Nothing within {COUNT_RADIUS} counts of {count} produces that hand, in any order. Either a card is
                misread, or the count is further out than the search covers. Check the cards first, since one wrong name
                is enough.
              </Alert>
            )}

            {found && found.candidates.length > 0 && !found.orderMatched && (
              <Alert icon={<IconAlertTriangle />} color="orange" variant="light" title="Matched ignoring order">
                No state produces those cards in that order, so they were matched as a set. That&apos;s far less
                specific, so treat the result below as a lead rather than an answer.
              </Alert>
            )}

            {only && (
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge variant="light" color={only.count === count ? 'green' : 'orange'}>
                    Count was {only.count}
                    {only.count === count ? ' (as tracked)' : ` (${signed(only.count - count)} vs tracked ${count})`}
                  </Badge>
                  <Badge variant="light" color="gray">
                    Landed on frame {only.frame}
                    {expectedFrame === undefined ? '' : ` (aimed at ${expectedFrame})`}
                  </Badge>
                </Group>
                <MashResult label="Next challenge" result={nextAttempt(only)} color="blue" platform={platform} />
                <Text size="xs" c="dimmed">
                  Challenge her again without fighting anything or leaving the screen in between. Nothing in the card
                  game moves the RNG, but a battle would.
                </Text>
              </Stack>
            )}

            {found && found.candidates.length > 1 && (
              <Alert
                icon={<IconInfoCircle />}
                color="yellow"
                variant="light"
                title={`${found.candidates.length} possible states`}
              >
                <Text size="sm" mb="xs">
                  That hand fits more than one place in the search range. Saying who moved first usually settles it.
                  Failing that, play one more game and enter that hand instead.
                </Text>
                <List size="sm" spacing={2}>
                  {found.candidates.slice(0, 6).map((candidate) => (
                    <List.Item key={`${candidate.count}-${candidate.frame}`}>
                      count {candidate.count} ({signed(candidate.count - count)}
                      ), frame {candidate.frame}, next attempt on frame {nextAttempt(candidate).frame}
                    </List.Item>
                  ))}
                </List>
              </Alert>
            )}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

