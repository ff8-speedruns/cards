/**
 * The strat files that ship with the tool, so it works without an upload.
 *
 * These come from the Card_Manip tool's bundled routes - credit to Kaivel and
 * the runners who worked them out. They're in that tool's original format,
 * which `lib/strat.js` reads as-is; nothing was rewritten, so they can be
 * refreshed from upstream by dropping the files in and adding a line here.
 */
import finManipQzOrEcm from './fin-manip-qz-or-ecm.json';
import lcm from './lcm.json';
import advancedEcm from './any-ecm-advanced-ecm.json';
import ecmEarlyQ from './any-ecm-ecm-earlyq.json';
import finManipEcmWaves from './any-ecm-fin-manip-ecm-waves.json';
import standardEcm from './any-ecm-standard-ecm.json';
import normalZmanip from './any-q-z-early-q-normal-zmanip.json';
import normalZmanipEcm from './any-q-z-early-q-normal-zmanip-ecm.json';
import detailedQz from './any-q-z-late-q-detailed-q-z.json';
import simpleQz from './any-q-z-late-q-simple-q-z.json';
import kynosQz from './pc-100-100-kynos-q-z.json';
import { STANDARD_ROUTE } from '../routes/standard';

export const BUILT_IN_STRATS = [
  // Modelled encounter by encounter rather than loaded from a file, so route
  // variations are toggles instead of a different strat.
  { id: 'standard', name: 'Standard route', group: 'Built in', data: STANDARD_ROUTE },
  { id: 'simple-q-z', name: 'Simple Q+Z', group: 'Any% Q+Z - Late Q', data: simpleQz },
  { id: 'detailed-q-z', name: 'Detailed Q+Z', group: 'Any% Q+Z - Late Q', data: detailedQz },
  { id: 'normal-zmanip', name: 'Normal Zmanip', group: 'Any% Q+Z - Early Q', data: normalZmanip },
  { id: 'normal-zmanip-ecm', name: 'Normal Zmanip ECM', group: 'Any% Q+Z - Early Q', data: normalZmanipEcm },
  { id: 'standard-ecm', name: 'Standard ECM', group: 'Any% ECM', data: standardEcm },
  { id: 'advanced-ecm', name: 'Advanced ECM', group: 'Any% ECM', data: advancedEcm },
  { id: 'ecm-early-q', name: 'ECM EarlyQ', group: 'Any% ECM', data: ecmEarlyQ },
  { id: 'fin-manip-ecm-waves', name: 'Fin Manip ECM (Waves)', group: 'Any% ECM', data: finManipEcmWaves },
  { id: 'fin-manip-qz-or-ecm', name: 'Fin Manip QZ or ECM', group: 'Other', data: finManipQzOrEcm },
  { id: 'lcm', name: 'LCM', group: 'Other', data: lcm },
  { id: 'kynos-q-z', name: '100% Kynos Q+Z', group: 'PC 100%', data: kynosQz },
];

export const BUILT_IN_BY_ID = new Map(BUILT_IN_STRATS.map((strat) => [strat.id, strat]));
