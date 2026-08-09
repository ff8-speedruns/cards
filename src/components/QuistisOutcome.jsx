import { Group, Paper, SegmentedControl, Select, Stack, Text } from '@mantine/core';
import { CARD_BY_ID } from '../lib/cardTable';
import { quistisFrameOptions } from '../lib/quistisFrames';
import { useShowStats } from '../lib/statsMode';
import CardImage from './CardImage';

/**
 * Which Quistis manipulation is being run, and which deck the opponent had.
 *
 * Early is taken before any tracked encounter, so it always offers the same
 * seven decks and everything after still counts toward Zell. Late is taken at
 * the accumulated count, offering whatever is winnable there, and restarts the
 * count for Zell.
 */
export default function QuistisOutcome({ mode, onModeChange, frame, onFrameChange, quistisCount, resolvedState }) {
  const showStats = useShowStats();
  // Early Quistis happens before anything is counted, so its decks are the ones
  // at a count of zero: the seven fixed patterns.
  const lookupCount = mode === 'early' ? 0 : quistisCount;
  const options = quistisFrameOptions(lookupCount);
  const selected = options.find((option) => option.frame === frame) ?? options[0];

  // Keyed by the Select's string values: `renderOption` receives only the plain
  // `{ value, label }` item, not the rest of the option.
  const tellsByValue = new Map(options.map((option) => [String(option.frame), option.tellIds]));

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Stack gap={4}>
          <Text size="sm" fw={600}>
            Quistis card
          </Text>
          <SegmentedControl
            value={mode}
            onChange={onModeChange}
            data={[
              { value: 'early', label: 'Early Quistis' },
              { value: 'late', label: 'Late Quistis' },
            ]}
          />
          <Text size="xs" c="dimmed">
            {mode === 'early'
              ? 'Get Quistis card before leaving Balamb Garden.'
              : 'Get Quistis card after Ifrit battle.'}
          </Text>
        </Stack>

        {options.length > 0 ? (
          <Stack gap={4}>
            <Select
              label="Which deck did the opponent have?"
              description="Named by its first two cards, the way the frames are usually written. Type to filter."
              data={options.map((option) => ({ value: String(option.frame), label: option.label }))}
              value={selected ? String(selected.frame) : null}
              onChange={(next) => next !== null && onFrameChange(Number(next))}
              renderOption={({ option }) => (
                <Group gap="xs" wrap="nowrap">
                  {(tellsByValue.get(option.value) ?? []).map((cardId) => (
                    <CardImage key={cardId} card={CARD_BY_ID.get(cardId)} />
                  ))}
                  <span>{option.label}</span>
                </Group>
              )}
              searchable
              allowDeselect={false}
              maxDropdownHeight={280}
            />
            {selected && (
              <Text size="xs" c="dimmed">
                Frame {selected.frame} · full deck {selected.deckNames.join(', ')}
                {showStats && resolvedState !== null && ` · Zell starts from ${resolvedState.toString(16).padStart(8, '0')}`}
              </Text>
            )}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed">
            No published decks at a Quistis count of {quistisCount}.
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

