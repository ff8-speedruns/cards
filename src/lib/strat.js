/**
 * Reads a strat file into one internal shape.
 *
 * Two formats are accepted: the Card_Manip format (a bare array of pages), which
 * every community strat file uses, and our own (an object with `pages`), which is
 * terser and supports branching. See the tool's own "Writing your own strat file"
 * panel for the field reference.
 */

const id = (...parts) => parts.filter((part) => part !== '').join('/');

const toNumber = (value, fallback = 0) => {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const toOptions = (values) =>
  (values ?? [])
    .map((option) => ({ label: String(option.label ?? ''), value: toNumber(option.value) }))
    .filter((option) => option.label !== '' || option.value !== 0);

/**
 * The RNG each occurrence is worth, if a legacy `buttons` group is really a tally
 * - numeric labels naming how many times, against values that are that multiple.
 * Returns null when the options are named alternatives instead.
 *
 * Labels needn't start at 1 (a route expecting three to five limits labels them
 * "3","4","5" against 3,4,5) but must be entirely numeric, or "2 Renzo" would
 * look like a count of two.
 */
function tallyStep(options) {
  const counts = options.map((o) => (/^\d+$/.test(o.label.trim()) ? Number(o.label.trim()) : NaN));
  if (counts.length === 0 || counts.some((c) => !Number.isInteger(c) || c < 1)) return null;
  if (counts.some((c, i) => i > 0 && c <= counts[i - 1])) return null;

  const step = options[0].value / counts[0];
  if (!Number.isInteger(step) || step === 0) return null;
  if (options.some((o, i) => o.value !== step * counts[i])) return null;
  return step;
}

/** Groups share this shape whichever format they came from. */
const group = (fields, { id: groupId, label = '', when = null, repeatable = false, repeatLabel = null, instances = 1 }) => ({
  id: groupId,
  label,
  when,
  repeatable,
  repeatLabel,
  defaultInstances: instances,
  fields,
});

// --- Card_Manip format -------------------------------------------------------

function legacyField(raw, fieldId) {
  const label = String(raw.label ?? '').trim();
  const type = String(raw.type ?? '').toLowerCase();
  const options = toOptions(raw.value);

  // Empty-typed entries with decorative labels were used as spacers.
  if (type === '' || options.length === 0) return { kind: 'note', id: fieldId, label };
  if (type === 'list') {
    return { kind: 'repeat', id: fieldId, label, count: Math.max(1, toNumber(raw.times, 1)), options };
  }
  if (type === 'radiobutton') return { kind: 'choice', id: fieldId, label, options };

  // buttons: a tally becomes a counter, since ticking both "3" and "4" to mean
  // seven limits was never the intent. Named alternatives stay as they are.
  const step = tallyStep(options);
  return step === null
    ? { kind: 'multiChoice', id: fieldId, label, options }
    : { kind: 'counter', id: fieldId, label, each: step, defaultCount: 0 };
}

const parseLegacy = (raw) => ({
  toggles: [],
  pages: raw.map((page, p) => {
    // baseValue is sometimes a string, and -1 means "no base of its own".
    const base = toNumber(page.baseValue, -1);
    return {
      id: String(p),
      label: String(page.label ?? `Page ${p + 1}`),
      // `button` true tracks toward the Quistis card, false toward Zell.
      target: page.button ? 'quistis' : 'zell',
      base: base === -1 ? null : base,
      continuesFrom: page.baseCountPage ? String(page.baseCountPage) : null,
      groups: (page.categories ?? []).map((category, g) =>
        group(
          (category.subCategories ?? []).map((sub, f) => legacyField(sub, id(String(p), String(g), String(f)))),
          { id: id(String(p), String(g)), label: String(category.label ?? '') }
        )
      ),
    };
  }),
});

// --- our format --------------------------------------------------------------

function field(raw, fieldId) {
  const label = String(raw.label ?? '').trim();

  if (raw.fixed !== undefined) return { kind: 'fixed', id: fieldId, label, value: toNumber(raw.fixed) };
  if (raw.each !== undefined) {
    return { kind: 'counter', id: fieldId, label, each: toNumber(raw.each), defaultCount: toNumber(raw.default, 0) };
  }
  if (Array.isArray(raw.choose)) {
    const options = toOptions(raw.choose);
    return raw.repeat === undefined
      ? { kind: 'choice', id: fieldId, label, options }
      : { kind: 'repeat', id: fieldId, label, count: Math.max(1, toNumber(raw.repeat, 1)), options };
  }
  if (Array.isArray(raw.any)) return { kind: 'multiChoice', id: fieldId, label, options: toOptions(raw.any) };
  return { kind: 'note', id: fieldId, label };
}

/**
 * Route-level questions that change which encounters happen at all, rather than
 * how much RNG one cost. Groups opt into a branch with `when`.
 */
const parseToggles = (raw) =>
  (raw ?? []).map((toggle, i) => {
    const options = Array.isArray(toggle.choose)
      ? toggle.choose.map((o) => ({ value: String(o.value), label: String(o.label ?? o.value) }))
      : null;
    return {
      id: String(toggle.id ?? `toggle${i}`),
      label: String(toggle.label ?? toggle.id ?? `Option ${i + 1}`),
      description: toggle.description ? String(toggle.description) : null,
      kind: options ? 'select' : 'switch',
      options,
      default: options ? String(toggle.default ?? options[0]?.value ?? '') : Boolean(toggle.default),
    };
  });

const parseWhen = (when) =>
  !when || when.toggle === undefined
    ? null
    : { toggle: String(when.toggle), is: typeof when.is === 'boolean' ? when.is : String(when.is) };

const parseCurrent = (raw) => ({
  toggles: parseToggles(raw.toggles),
  pages: (raw.pages ?? []).map((page, p) => ({
    id: String(p),
    label: String(page.label ?? `Page ${p + 1}`),
    target: page.target === 'quistis' ? 'quistis' : 'zell',
    base: page.base === undefined || page.base === null ? null : toNumber(page.base),
    continuesFrom: page.continuesFrom ? String(page.continuesFrom) : null,
    groups: (page.groups ?? []).map((g, gi) =>
      group(
        (g.fields ?? []).map((f, fi) => field(f, id(String(p), String(gi), String(fi)))),
        {
          id: id(String(p), String(gi)),
          label: String(g.label ?? ''),
          when: parseWhen(g.when),
          repeatable: Boolean(g.repeatable),
          repeatLabel: g.repeatLabel ? String(g.repeatLabel) : null,
          instances: Math.max(0, toNumber(g.defaultInstances, 1)),
        }
      )
    ),
  })),
});

/** Throws with a message worth showing the user if the file isn't usable. */
export function parseStrat(raw) {
  if (raw == null) throw new Error('That file is empty.');

  const strat = Array.isArray(raw) ? parseLegacy(raw) : parseCurrent(raw);
  if (strat.pages.length === 0) {
    throw new Error(
      Array.isArray(raw) ? 'That file has no pages in it.' : 'That file has no `pages` array - it may not be a strat file.'
    );
  }
  return strat;
}

/** Every field in a strat, flattened. */
const allFields = (strat) => strat.pages.flatMap((page) => page.groups.flatMap((entry) => entry.fields));

const allGroups = (strat) => strat.pages.flatMap((page) => page.groups);

/**
 * A strat's starting answers. Applied under whatever the runner has changed, so
 * switching route picks up its own branches and counts rather than the last one's.
 */
export const stratDefaults = (strat) => ({
  toggles: Object.fromEntries(strat.toggles.map((t) => [t.id, t.default])),
  instances: Object.fromEntries(allGroups(strat).filter((g) => g.repeatable).map((g) => [g.id, g.defaultInstances])),
  selections: Object.fromEntries(
    allFields(strat)
      .filter((field) => field.kind === 'counter' && field.defaultCount)
      .map((field) => [field.id, field.defaultCount])
  ),
});

/**
 * Where each of a page's toggles belongs, keyed by the index of the first group
 * that branches on it, so a question sits with the fights it decides between.
 *
 * Indexed against the full group list, never the filtered one: a group gated on
 * its own toggle disappears when that toggle is off, which would move the
 * question. Toggles this page doesn't branch on are absent from the result.
 */
export function toggleAnchors(page, toggles) {
  const anchors = new Map();
  for (const toggle of toggles) {
    const index = page.groups.findIndex((group) => group.when?.toggle === toggle.id);
    if (index === -1) continue;
    if (!anchors.has(index)) anchors.set(index, []);
    anchors.get(index).push(toggle);
  }
  return anchors;
}

/** Whether a group's branch condition is met. */
export const groupApplies = (group_, toggles) =>
  !group_.when ||
  (typeof group_.when.is === 'boolean'
    ? Boolean(toggles?.[group_.when.toggle]) === group_.when.is
    : String(toggles?.[group_.when.toggle]) === group_.when.is);

/** How many copies of a group are in play. */
export const groupInstances = (group_, instanceCounts) => {
  if (!group_.repeatable) return 1;
  const n = Number(instanceCounts?.[group_.id]);
  return Math.max(0, Number.isFinite(n) ? n : group_.defaultInstances);
};

/** Field ids are per-group, so repeated groups fold the instance in to stay separate. */
export const instanceFieldId = (field_, instance) => (instance === 0 ? field_ : `${field_}#${instance}`);
