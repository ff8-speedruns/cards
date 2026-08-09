/**
 * The standard Dollet route, modelled encounter by encounter so it needs no
 * strat file - pick the branches you took and log what happened.
 *
 * Transcribed from FF8-Utilities' encounter models (`FF8Utilities.Common/Cards/
 * Encounters/**`), which give every encounter its own base and ability list
 * rather than lumping the fixed values into one number per area. That's what
 * makes branching possible: an encounter can be added or dropped on its own.
 *
 * Per-action values, all cross-checked against the Card_Manip strat files:
 *   Squall 2, Seifer 2, Zell 4, Soldier 2, Limits 1
 *   Squeeze 3, Dark Mist 1, Biggs machine gun 5, Biggs charge 4,
 *   Wedge fire 28, Elvoret spell 12, Elvoret storm breath 1, Ray Bomb 1
 */

const squall = { label: 'Squall attacks', each: 2 };
const seifer = { label: 'Seifer attacks', each: 2 };
const zell = { label: 'Zell attacks', each: 4 };
const soldier = { label: 'Soldier attacks', each: 2 };
const limits = (count = 0) => ({ label: 'Limit breaks', each: 1, default: count });

/**
 * Victory fanfare camera for a two-character party.
 *
 * There's no "none" - a win always shows one of these. The reference's camera
 * lists include a zero-valued None entry, but that stands for "not answered
 * yet", which here is just leaving the field alone.
 */
const twoPersonCamera = {
  label: 'Fanfare camera',
  choose: [
    { label: '1 character', value: 2 },
    { label: '2 characters', value: 3 },
  ],
};

/** ...and for three, which adds the one-to-one shot. */
const threePersonCamera = {
  label: 'Fanfare camera',
  choose: [
    { label: '1 character', value: 2 },
    { label: 'One to one', value: 3 },
    { label: '3 characters', value: 4 },
  ],
};

const twoSoldiers = (label) => ({
  label,
  fields: [{ label: 'Base', fixed: 18 }, squall, seifer, zell, soldier],
});

const oneSoldier = (label, camera = true) => ({
  label,
  fields: [{ label: 'Base', fixed: 14 }, squall, seifer, zell, soldier, ...(camera ? [threePersonCamera] : [])],
});

export const STANDARD_ROUTE = {
  name: 'Standard route (no file needed)',

  toggles: [
    {
      id: 'ifritBranch',
      label: 'Second encounter in the cavern',
      description: 'Which fight you got after Ifrit.',
      choose: [
        { value: 'buel', label: 'Buel' },
        { value: 'redBat', label: '2x Red Bats' },
      ],
      default: 'buel',
    },
    {
      id: 'secondBridge',
      label: 'Got the 3x Soldier bridge fight',
      description: 'Taking this fight replaces the mountain soldier after Anacondaur.',
      default: false,
    },
    {
      id: 'redSoldier',
      label: 'Fought the elite (red) soldier',
      default: false,
    },
    {
      id: 'extraAtm',
      label: 'Extra X-ATM092 encounter',
      description: 'Worth another 13 if it caught up with you again.',
      default: false,
    },
  ],

  pages: [
    {
      label: "Ifrit's Cavern",
      target: 'quistis',
      base: 0,
      groups: [
        { label: '2x Bats', fields: [{ label: 'Base', fixed: 15 }, squall, twoPersonCamera] },
        {
          label: 'Tutorial fight (2x bat, 2x bomb)',
          fields: [{ label: 'Always 23', fixed: 23 }],
        },
        {
          label: 'Ifrit',
          // The +2 is the camera, which this fight always shows.
          fields: [{ label: 'Base', fixed: 10 }, { label: 'Camera', fixed: 2 }, limits(), squall, { label: 'Ifrit punches', each: 2 }],
        },
        {
          label: 'Buel',
          when: { toggle: 'ifritBranch', is: 'buel' },
          fields: [{ label: 'Base', fixed: 11 }, { label: 'Buel attacks', each: 5 }, squall, twoPersonCamera],
        },
        {
          label: '2x Red Bats',
          when: { toggle: 'ifritBranch', is: 'redBat' },
          fields: [{ label: 'Base', fixed: 15 }, squall, twoPersonCamera],
        },
        { label: 'Bomb encounter', fields: [{ label: 'Always 11', fixed: 11 }] },
      ],
    },

    {
      label: 'World map',
      target: 'quistis',
      continuesFrom: "Ifrit's Cavern",
      groups: [
        {
          label: 'Random encounters',
          repeatable: true,
          repeatLabel: 'encounter',
          defaultInstances: 0,
          fields: [
            {
              label: 'Formation',
              choose: [
                { label: 'Bite Bug', value: 11 },
                { label: '2x Bite Bug', value: 15 },
                { label: '3x Bite Bug', value: 19 },
                { label: 'Glacial Eye', value: 11 },
                { label: 'Caterchipillar', value: 10 },
                { label: 'Caterchipillar & 2x Bite Bug', value: 18 },
                { label: 'T-Rexaur', value: 10 },
              ],
            },
          ],
        },
      ],
    },

    {
      label: 'Fish Fins',
      target: 'quistis',
      continuesFrom: "Ifrit's Cavern",
      groups: [
        {
          label: 'Fish Fins fight',
          repeatable: true,
          repeatLabel: 'fight',
          defaultInstances: 3,
          fields: [
            { label: 'Base', fixed: 15 },
            squall,
            limits(2),
            {
              // The fins float up when hit; one surfacing costs half as much as both.
              label: 'Fins that floated',
              choose: [
                { label: 'Both', value: 22 },
                { label: 'One only', value: 11 },
              ],
            },
            twoPersonCamera,
          ],
        },
      ],
    },

    {
      label: 'Dollet',
      target: 'zell',
      base: 0,
      groups: [
        twoSoldiers('[1st] 2x Soldier'),
        twoSoldiers('[2nd] 2x Soldier'),
        oneSoldier('[3rd] Soldier', false),
        oneSoldier('[4th] Soldier'),
      ],
    },

    {
      label: 'Anacondaur',
      target: 'zell',
      continuesFrom: 'Dollet',
      groups: [
        oneSoldier('Bridge Soldier'),
        {
          label: '3x Soldier (bridge)',
          when: { toggle: 'secondBridge', is: true },
          fields: [{ label: 'Base', fixed: 22 }, squall, seifer, zell, soldier, threePersonCamera],
        },
        {
          label: 'Anacondaur',
          fields: [
            { label: 'Base', fixed: 14 },
            squall,
            seifer,
            zell,
            limits(1),
            { label: 'Squeeze', each: 3 },
            { label: 'Dark Mist', each: 1 },
            {
              // The reference subtracts one from the three-character fanfare when
              // somebody died, so the two are offered as one question.
              label: 'Fanfare camera',
              choose: [
                { label: '1 character', value: 2 },
                { label: 'One to one', value: 3 },
                { label: '3 characters, all alive', value: 4 },
                { label: '3 characters, someone died', value: 3 },
              ],
            },
          ],
        },
        {
          label: 'Mountain Soldier',
          // Only happens if the bridge fight didn't.
          when: { toggle: 'secondBridge', is: false },
          fields: [{ label: 'Base', fixed: 14 }, squall, seifer, zell, soldier, threePersonCamera],
        },
      ],
    },

    {
      label: 'Elvoret + X-ATM092',
      target: 'zell',
      continuesFrom: 'Dollet',
      groups: [
        {
          label: 'Biggs, Wedge & Elvoret',
          fields: [
            { label: 'Base', fixed: 16 },
            // Elvoret turning up costs 3 on its own.
            { label: 'Elvoret appears', fixed: 3 },
            squall,
            zell,
            { label: 'Biggs machine gun', each: 5 },
            { label: 'Biggs arm charge', each: 4 },
            { label: 'Wedge fire', each: 28 },
            { label: 'Elvoret spell', each: 12 },
            { label: 'Elvoret storm breath', each: 1 },
            limits(4),
            {
              label: 'Fanfare camera',
              choose: [
                { label: 'One to one', value: 2 },
                { label: '1-2 characters dead', value: 2 },
                { label: 'Other', value: 3 },
              ],
            },
          ],
        },
        {
          label: 'X-ATM092',
          fields: [{ label: 'Base', fixed: 13 }, squall, zell, limits(1), { label: 'Ray Bomb', each: 1 }],
        },
        {
          label: 'Extra X-ATM092 encounter',
          when: { toggle: 'extraAtm', is: true },
          fields: [{ label: 'Always 13', fixed: 13 }],
        },
        {
          label: 'Elite (red) Soldier',
          when: { toggle: 'redSoldier', is: true },
          fields: [
            { label: 'Base', fixed: 13 },
            squall,
            zell,
            { label: 'Machine gun', each: 5 },
            { label: 'Charge', each: 4 },
          ],
        },
      ],
    },
  ],
};
