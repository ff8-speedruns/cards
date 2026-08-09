import { useEffect, useState } from 'react';
import { Alert, Anchor, Group, Paper, SegmentedControl, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { ToolShell } from '@ff8-speedruns/ui';
import { BUILT_IN_STRATS, BUILT_IN_BY_ID } from './data/strats';
import { parseStrat, stratDefaults } from './lib/strat';
import { countStrat } from './lib/count';
import { PLAYERS, solve } from './lib/cardRng';
import { quistisResultState, winnableFrames } from './data/quistisResults';
import { deleteUploadedStrat, loadSession, loadUploadedStrats, saveSession, saveUploadedStrat } from './lib/storage';
import { StatsProvider } from './lib/statsMode';
import StratPicker from './components/StratPicker';
import CountTracker from './components/CountTracker';
import CountSummary from './components/CountSummary';
import QuistisOutcome from './components/QuistisOutcome';
import MashResult from './components/MashResult';
import SecondTryZell from './components/SecondTryZell';
import ResetAllButton from './components/ResetAllButton';
import HelpPanels from './components/HelpPanels';

const DEFAULT_STRAT_ID = 'standard';

/** A battle's RNG state before anything has consumed it. */
const FRESH_STATE = 1;

/**
 * A fresh run. Everything here is persisted together, so it's one piece of state.
 * A saved session is this shape with the runner's answers on top.
 *
 * Empty selections mean "use the strat's defaults"; anything set overrides them.
 */
const NEW_SESSION = {
  stratId: DEFAULT_STRAT_ID,
  selections: {},
  toggles: {},
  instanceCounts: {},
  extraQuistis: 0,
  extraZell: 0,
  quistisMode: 'early',
  // Per mode, since early and late draw their frames from different sets.
  earlyFrame: 1,
  lateFrame: 1,
  // Which console, for the timers' screen-transition delay. A property of the
  // setup rather than the run, so it survives a reset and is asked once.
  platform: 'pc',
  showStats: false,
};

/** What a reset clears. The rest describes what you're running, not how far in. */
const RUN_STATE = ['selections', 'toggles', 'instanceCounts', 'extraQuistis', 'extraZell', 'earlyFrame', 'lateFrame'];

const freshRunState = () => Object.fromEntries(RUN_STATE.map((key) => [key, NEW_SESSION[key]]));

/** Route options for the picker, built-ins grouped as declared, uploads last. */
function pickerOptions(uploaded) {
  const groups = new Map();
  for (const strat of BUILT_IN_STRATS) {
    if (!groups.has(strat.group)) groups.set(strat.group, []);
    groups.get(strat.group).push({ value: strat.id, label: strat.name });
  }
  const options = [...groups].map(([group, items]) => ({ group, items }));
  if (uploaded.length > 0) {
    options.push({
      group: 'Your uploads',
      items: uploaded.map((s) => ({ value: s.id, label: s.name })),
    });
  }
  return options;
}

/**
 * Always returns a usable strat. Uploads are validated before they're stored, so
 * a parse failure here means a corrupted entry, and falling back to the default
 * route beats rendering nothing.
 */
function findStrat(stratId, uploaded) {
  const fallback = BUILT_IN_BY_ID.get(DEFAULT_STRAT_ID);
  const source = BUILT_IN_BY_ID.get(stratId) ?? uploaded.find((s) => s.id === stratId) ?? fallback;
  try {
    return parseStrat(source.data);
  } catch {
    return parseStrat(fallback.data);
  }
}

export default function App() {
  // Read once on mount; after that the effect below is the only thing that
  // touches storage.
  const [session, setSession] = useState(() => ({ ...NEW_SESSION, ...loadSession() }));
  const [uploaded, setUploaded] = useState(loadUploadedStrats);
  const [error, setError] = useState(null);

  const update = (changes) => setSession((current) => ({ ...current, ...changes }));

  const { stratId, selections, toggles, instanceCounts, extraQuistis, extraZell } = session;
  const { quistisMode, earlyFrame, lateFrame, platform, showStats } = session;

  // None of this is memoised: parsing a strat and counting it are a few hundred
  // arithmetic operations, and solving a battle a few thousand, so caching them
  // would cost more in complexity than it saves.
  const strat = findStrat(stratId, uploaded);
  const defaults = stratDefaults(strat);

  const answers = {
    selections: { ...defaults.selections, ...selections },
    toggles: { ...defaults.toggles, ...toggles },
    instanceCounts: { ...defaults.instances, ...instanceCounts },
  };

  const totals = countStrat(strat, answers.selections, {
    toggles: answers.toggles,
    instanceCounts: answers.instanceCounts,
    extraQuistis,
    extraZell,
  });
  const quistisCount = Math.max(0, totals.quistis);
  const early = quistisMode === 'early';

  // Early Quistis is won before anything is counted, so its frames are the fixed
  // set at count 0. Late uses whatever is winnable at the count reached by then.
  const lookupCount = early ? 0 : quistisCount;
  const frames = winnableFrames(lookupCount);
  const frame = early ? earlyFrame : lateFrame;
  const activeFrame = frames.includes(frame) ? frame : (frames[0] ?? null);

  // The Zell battle starts from the state the Quistis game ended on, which
  // depends on the frame it was won and so has to be looked up.
  const zellSeed = activeFrame === null ? null : quistisResultState(lookupCount, activeFrame);

  // Winning early leaves every tracked encounter counting toward Zell; winning
  // late restarts the count from that battle.
  const zellCount = Math.max(0, early ? totals.quistis + totals.zell : totals.zell);
  // The Quistis battle is only worth predicting while it hasn't happened yet.
  const quistisResult = early ? null : solve(FRESH_STATE, quistisCount, PLAYERS.fc01);
  const zellResult = zellSeed === null ? null : solve(zellSeed, zellCount, PLAYERS.zellmama);

  useEffect(() => {
    saveSession(session);
  }, [session]);

  // Ids are positional, so answers can't carry across a route change.
  const selectStrat = (id) => {
    if (!id) return;
    update({ stratId: id, selections: {}, toggles: {}, instanceCounts: {} });
    setError(null);
  };

  // Takes a value or an updater, so a control stepping from its current answer
  // stays correct when several taps land in one render.
  const setField = (fieldId, value) =>
    setSession((current) => ({
      ...current,
      selections: {
        ...current.selections,
        [fieldId]: typeof value === 'function' ? value(current.selections[fieldId]) : value,
      },
    }));

  const onToggleChange = (toggleId, value) =>
    setSession((current) => ({ ...current, toggles: { ...current.toggles, [toggleId]: value } }));

  /**
   * Back to a fresh run. Keeps the route, the Early/Late choice and the platform -
   * those describe what you're running and on what, not how far into it you are.
   */
  const resetAll = () => update(freshRunState());

  const upload = async (file) => {
    try {
      const data = JSON.parse(await file.text());
      parseStrat(data); // validate before storing, so a bad file can't wedge a reload
      const entry = { id: `upload:${file.name}`, name: file.name.replace(/\.json$/i, ''), data };
      setUploaded(saveUploadedStrat(entry));
      selectStrat(entry.id);
    } catch (parseError) {
      setError(`${file.name}: ${parseError.message}`);
    }
  };

  const remove = (id) => {
    setUploaded(deleteUploadedStrat(id));
    if (stratId === id) selectStrat(DEFAULT_STRAT_ID);
  };

  return (
    <ToolShell
      title="Card RNG Manip"
      status="development"
      repo="cards"
      intro="Track early-game RNG to line up the Quistis and Zell card manipulations."
      credits={
        <>
          Routes and research by <Anchor href="https://twitch.tv/kaivel">Kaivel</Anchor>,{' '}
          <Anchor href="https://twitch.tv/kiitoksia">Kiitoksia</Anchor>, and{' '}
          <Anchor href="https://github.com/pingval/Speedrun/blob/master/FF8/ff8_zellmama_en.rb">Pingval</Anchor>.
        </>
      }
    >
      <StatsProvider value={showStats}>
        <Stack gap="lg">
          <StratPicker
            options={pickerOptions(uploaded)}
            value={stratId}
            onChange={selectStrat}
            onUpload={upload}
            onDelete={remove}
            uploadedIds={uploaded.map((s) => s.id)}
          />

          {error && (
            <Alert color="red" variant="light" withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="xs" align="center" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Platform
              </Text>
              <SegmentedControl
                size="xs"
                value={platform}
                onChange={(value) => update({ platform: value })}
                data={[
                  { value: 'pc', label: 'PC 2013' },
                  { value: 'ps2', label: 'PS2/PSX' },
                ]}
              />
              <Switch
                size="sm"
                label="Stats for nerds"
                checked={showStats}
                onChange={(event) => update({ showStats: event.currentTarget.checked })}
              />
            </Group>
            <ResetAllButton onReset={resetAll} />
          </Group>

          <CountSummary
            totals={totals}
            extraQuistis={extraQuistis}
            extraZell={extraZell}
            onExtraQuistis={(value) => update({ extraQuistis: value })}
            onExtraZell={(value) => update({ extraZell: value })}
          />

          <SimpleGrid cols={{ base: 1, md: quistisResult ? 2 : 1 }}>
            {quistisResult && (
              <MashResult
                label="Quistis card"
                count={quistisCount}
                result={quistisResult}
                color="grape"
                platform={platform}
                hotkey="q"
              />
            )}
            {zellResult ? (
              <MashResult
                label="Zell card"
                count={zellCount}
                result={zellResult}
                color="blue"
                platform={platform}
                hotkey="z"
              />
            ) : (
              <Paper withBorder radius="md" p="md">
                <Text fw={600}>Zell card</Text>
                <Text size="xs" c="dimmed">
                  No published state for a Quistis count of {quistisCount}.
                </Text>
              </Paper>
            )}
          </SimpleGrid>

          {/* Outcomes, after the tracking that leads to them, so a run reads top to bottom. */}
          <QuistisOutcome
            mode={quistisMode}
            onModeChange={(mode) => update({ quistisMode: mode })}
            frame={activeFrame ?? 1}
            onFrameChange={(next) => update(early ? { earlyFrame: next } : { lateFrame: next })}
            quistisCount={quistisCount}
            resolvedState={zellSeed}
          />

          <CountTracker
            strat={strat}
            totals={totals}
            selections={answers.selections}
            toggles={answers.toggles}
            instanceCounts={answers.instanceCounts}
            onChange={setField}
            onToggleChange={onToggleChange}
            onInstancesChange={(groupId, count) =>
              setSession((current) => ({
                ...current,
                instanceCounts: { ...current.instanceCounts, [groupId]: Math.max(0, count) },
              }))
            }
          />

          {zellResult && (
            <SecondTryZell seed={zellSeed} count={zellCount} expectedFrame={zellResult.frame} platform={platform} />
          )}

          <HelpPanels />
        </Stack>
      </StatsProvider>
    </ToolShell>
  );
}
