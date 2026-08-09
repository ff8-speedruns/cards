/** RNG amounts always read as a delta, so positives carry their sign. */
export const signed = (value) => (value > 0 ? `+${value}` : String(value));

/** "2 characters (+3)" - for controls that can only show a plain string. */
export const optionText = (option) => `${option.label} (${signed(option.value)})`;
