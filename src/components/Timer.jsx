import { useEffect, useRef, useState } from 'react';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { useDocumentVisibility } from '@mantine/hooks';
import { DELAY_FRAME, TICK_HZ, liveFrameIndex, secondsUntilFrame } from '../lib/cardRng';
import FrameStrip from './FrameStrip';

/** Input types that swallow a plain letter because it's being typed into them. */
const TEXT_ENTRY_TYPES = new Set(['text', 'number', 'search', 'email', 'password', 'tel', 'url', 'date', 'time']);

/**
 * Whether a keystroke was aimed at somewhere text goes, so document-level
 * hotkeys can ignore it.
 *
 * Narrower than "is it an input" on purpose: radios and checkboxes keep focus
 * after a click, and treating those as text entry would make the hotkeys dead
 * for as long as one is focused.
 */
function isTextEntry(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return true;
  return target.tagName === 'INPUT' && TEXT_ENTRY_TYPES.has((target.type || 'text').toLowerCase());
}

/** Every stretch of consecutive available frames, in order, as `[start, end)`. */
function findWindows(frames) {
  const windows = [];
  let i = 0;
  while (i < frames.length) {
    if (!frames[i]) {
      i += 1;
      continue;
    }
    const start = i;
    while (i < frames.length && frames[i]) i += 1;
    windows.push({ start, end: i });
  }
  return windows;
}

/**
 * A stopwatch started the instant the card challenge is accepted, turning
 * "mash on frame N" into a countdown. It targets every window in `frames`, so
 * missing one carries on to the next rather than ending the attempt.
 *
 * Elapsed seconds don't map to a frame index 1:1 - a platform-dependent screen
 * transition has to pass first. `liveFrameIndex` and `secondsUntilFrame` are
 * the two directions of that conversion.
 *
 * The readout uses `performance.now()` so a suspended
 * audio context can't freeze it, while the beeps are scheduled on the Web Audio
 * clock, which keeps running when a background tab has its animation frames
 * throttled to about 1Hz. That throttling is why `hidden` exists - once the tab
 * loses focus the beeps stay accurate and the countdown doesn't, and the display
 * says so rather than showing a stale number.
 *
 * `platform` is set once for the whole app, and callers key this component on it
 * so switching console tears down any armed countdown rather than leaving beeps
 * scheduled against the old delay.
 */
export default function Timer({ frames, platform, hotkey = null }) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const hidden = useDocumentVisibility() === 'hidden';
  const startPerfRef = useRef(0);
  const rafRef = useRef(null);
  const audioRef = useRef(null);
  const scheduledRef = useRef([]);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      setElapsedMs(performance.now() - startPerfRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  useEffect(() => () => audioRef.current?.close(), []);

  const cancelScheduledBeeps = () => {
    for (const osc of scheduledRef.current) {
      try {
        osc.stop();
      } catch {
        // Already finished playing - nothing to cancel.
      }
    }
    scheduledRef.current = [];
  };

  const beepAt = (ctx, atTime, hz) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, atTime);
    gain.gain.exponentialRampToValueAtTime(0.3, atTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, atTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(atTime);
    osc.stop(atTime + 0.2);
    return osc;
  };

  const windows = findWindows(frames);

  const start = () => {
    cancelScheduledBeeps();

    // Constructed before either clock is read, so its cost falls outside both.
    let ctx = audioRef.current;
    if (!ctx) {
      try {
        ctx = new AudioContext();
        audioRef.current = ctx;
      } catch {
        ctx = null; // No audio available - the visual countdown still works without it.
      }
    }
    ctx?.resume().catch(() => {});

    // Read back to back so both clocks agree on when "now" is.
    const audioNow = ctx?.currentTime ?? 0;
    const perfNow = performance.now();
    startPerfRef.current = perfNow;

    if (ctx) {
      try {
        scheduledRef.current = windows.flatMap((w) => [
          beepAt(ctx, audioNow + secondsUntilFrame(w.start, platform), 880),
          beepAt(ctx, audioNow + secondsUntilFrame(w.end, platform), 330),
        ]);
      } catch {
        // Scheduling failed even though the context exists - fine, silent run.
      }
    }

    setElapsedMs(0);
    setRunning(true);
  };

  const reset = () => {
    cancelScheduledBeeps();
    setRunning(false);
  };

  const toggle = () => (running ? reset() : start());

  const onKeyDown = (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    toggle();
  };

  // The listener below binds once per hotkey, so it reads the current `toggle`
  // through this ref rather than capturing a stale one or rebinding every frame.
  useEffect(() => {
    toggleRef.current = toggle;
  });

  useEffect(() => {
    if (!hotkey) return undefined;
    const onHotkey = (event) => {
      if (event.key.toLowerCase() !== hotkey) return;
      // Leave browser and OS shortcuts alone.
      if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;
      if (isTextEntry(event.target)) return;
      event.preventDefault();
      toggleRef.current?.();
    };
    document.addEventListener('keydown', onHotkey);
    return () => document.removeEventListener('keydown', onHotkey);
  }, [hotkey]);

  // Which frame confirming right now would land on - not elapsed ticks, because
  // of the screen transition.
  const liveIndex = liveFrameIndex(elapsedMs / 1000, platform);
  // The window we're in, or the next one still ahead.
  const current = windows.find((w) => liveIndex < w.end);
  const phase = !running ? 'idle' : !current ? 'exhausted' : liveIndex >= current.start ? 'window' : 'waiting';

  return (
    <Box tabIndex={0} onKeyDown={onKeyDown} style={{ outline: 'none' }}>
      <Stack gap={6}>
        {/* A real-time axis, so the playhead takes elapsed ticks rather than
            `liveIndex` and sweeps at a constant rate through the lead-in. */}
        <FrameStrip
          frames={frames}
          first={windows[0]?.start ?? 0}
          leadIn={DELAY_FRAME[platform]}
          nowTick={running ? (elapsedMs / 1000) * TICK_HZ : null}
        />

        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={700} size={phase === 'window' && !(running && hidden) ? 'lg' : 'sm'} c={running && hidden ? 'orange' : { waiting: 'dimmed', window: 'green', exhausted: 'red' }[phase]}>
            {running && hidden && "Tab's in the background - trust the beeps, this countdown is frozen until you tab back"}
            {!(running && hidden) && phase === 'idle' && 'Press Start the instant you accept the challenge'}
            {!(running && hidden) &&
              phase === 'waiting' &&
              `${Math.max(0, secondsUntilFrame(current.start, platform) - elapsedMs / 1000).toFixed(2)}s to go`}
            {!(running && hidden) && phase === 'window' && 'MASH NOW'}
            {!(running && hidden) && phase === 'exhausted' && 'Past every predicted window - reset and try again'}
          </Text>
          <Button size="xs" variant={running ? 'light' : 'filled'} color={running ? 'red' : 'blue'} onClick={toggle}>
            {`${running ? 'Reset' : 'Start'} (${hotkey ? hotkey.toUpperCase() : 'Space'})`}
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

