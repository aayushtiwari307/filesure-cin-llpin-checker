import { companyTypeCodes, stateCodes } from '../data/researchMappings';

export type IdentifierKind = 'company' | 'llp' | 'unknown';
export type ValidationStatus = 'valid' | 'valid-with-warnings' | 'invalid';
export type SegmentKey =
  | 'listing'
  | 'industry'
  | 'state'
  | 'year'
  | 'companyType'
  | 'registration'
  | 'llpinPrefix'
  | 'llpinNumber'
  | 'input';

export interface IdentifierSegment {
  key: SegmentKey;
  label: string;
  value: string;
  meaning?: string;
  state?: 'normal' | 'invalid' | 'warning';
}

export interface IdentifierResult {
  entryNumber: number;
  rawInput: string;
  normalizedInput: string;
  canonicalValue: string;
  isNormalized: boolean;
  normalizationNotes: string[];
  kind: IdentifierKind;
  status: ValidationStatus;
  title: string;
  subtitle: string;
  segments: IdentifierSegment[];
  invalidSegment?: SegmentKey;
  listed?: boolean;
  stateName?: string;
  stateCode?: string;
  incorporationYear?: number;
  companyType?: string;
  companyTypeMeaning?: string;
  industryCode?: string;
  registrationNumber?: string;
  errors: string[];
  warnings: string[];
  information: string[];
  duplicateOfEntry?: number;
}

export interface ParseOptions {
  currentYear?: number;
  maxEntries?: number;
}

export interface IdentifierListResult {
  results: IdentifierResult[];
  totalEntries: number;
  processedEntries: number;
  ignoredBlankEntries: number;
  ignoredNonIdentifierCells: number;
  truncatedEntries: number;
  limitExceeded: boolean;
}

const DEFAULT_MAX_ENTRIES = 5_000;
const MIN_PLAUSIBLE_INCORPORATION_YEAR = 1850;
const CIN_LENGTH = 21;
const LLPIN_LENGTH_WITHOUT_HYPHEN = 7;

interface NormalizedValue {
  value: string;
  notes: string[];
}

function isIdentifierLikeCell(rawCell: string): boolean {
  const value = rawCell.trim().replace(/^["']|["']$/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  const compact = value.replace(/[ \t\u00A0\u202F]+/g, '').toUpperCase();
  // Keep malformed-but-CIN-shaped values (including a mistyped first letter)
  // so the checker can explain them instead of silently dropping the cell.
  const cinLike = /^[A-Z][A-Z0-9-]{18,22}$/.test(compact);
  const llpinLike = /^[A-Z]{3}-?\d{3,5}$/.test(compact);
  return cinLike || llpinLike;
}


const SPREADSHEET_HEADER_LABELS = new Set([
  'CIN', 'LLPIN', 'CIN/LLPIN', 'CIN / LLPIN', 'CIN NUMBER', 'CIN NO', 'LLPIN NUMBER', 'LLPIN NO',
  'COMPANY NAME', 'NAME OF COMPANY', 'ENTITY NAME', 'LLP NAME',
  'CORPORATE IDENTITY NUMBER', 'CORPORATE IDENTITY NO',
  'LIMITED LIABILITY PARTNERSHIP IDENTIFICATION NUMBER',
]);

function isSpreadsheetHeaderRow(cells: string[]): boolean {
  return cells.some((cell) => {
    const label = cell.trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, ' ').toUpperCase();
    return SPREADSHEET_HEADER_LABELS.has(label);
  });
}

function containsMultipleIdentifiersOnLine(rawInput: string): boolean {
  const tokens = rawInput
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
  return tokens.filter(isIdentifierLikeCell).length > 1;
}

function normalizeIdentifier(rawInput: string): NormalizedValue {
  const notes: string[] = [];
  let value = rawInput;

  const recordChange = (next: string, note: string) => {
    if (next !== value) {
      value = next;
      notes.push(note);
    }
  };

  recordChange(value.trim(), 'Leading or trailing whitespace removed');
  recordChange(value.replace(/[\u200B-\u200D\uFEFF]/g, ''), 'Zero-width formatting characters removed');
  recordChange(value.replace(/[\u00A0\u202F]/g, ' '), 'Non-breaking spaces normalised');
  recordChange(value.replace(/[ \t]+/g, ''), 'Embedded spaces or tabs removed');

  // Handle both `ID,` and CSV-style `"ID",` / `"ID,"` wrappers,
  // but remove at most one comma so malformed `ID,,` is never silently repaired.
  let removedTrailingComma = false;
  if (value.endsWith(',')) {
    recordChange(value.slice(0, -1), 'Trailing comma removed');
    removedTrailingComma = true;
  }

  // A single pair of wrapping quotes is a common spreadsheet/CSV paste artefact.
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      recordChange(value.slice(1, -1), 'Surrounding quotes removed');
    }
  }

  // Also support `"ID,"`; the comma is inside the quote pair in this form.
  if (!removedTrailingComma && value.endsWith(',')) {
    recordChange(value.slice(0, -1), 'Trailing comma removed');
  }

  recordChange(value.toUpperCase(), 'Lowercase letters converted to uppercase');
  return { value, notes };
}

function makeResult(
  entryNumber: number,
  rawInput: string,
  normalized: NormalizedValue,
  kind: IdentifierKind,
  options: ParseOptions,
): IdentifierResult {
  const base: IdentifierResult = {
    entryNumber,
    rawInput,
    normalizedInput: normalized.value,
    canonicalValue: normalized.value,
    isNormalized: normalized.notes.length > 0,
    normalizationNotes: normalized.notes,
    kind,
    status: 'invalid',
    title: 'Invalid identifier',
    subtitle: 'This entry needs attention.',
    segments: [],
    errors: [],
    warnings: [],
    information: [],
  };

  if (containsMultipleIdentifiersOnLine(rawInput)) {
    base.kind = 'unknown';
    base.title = 'Multiple identifiers on one line';
    base.subtitle = 'Put each CIN or LLPIN on its own line.';
    base.errors.push('This line appears to contain more than one identifier. Put each CIN or LLPIN on a separate line, then check the list again.');
    base.segments = [{ key: 'input', label: 'Input', value: rawInput.trim() || '—', state: 'invalid' }];
    base.invalidSegment = 'input';
    return base;
  }

  if (!normalized.value) {
    base.errors.push('Enter a CIN or LLPIN.');
    base.segments = [{ key: 'input', label: 'Input', value: '—', state: 'invalid' }];
    base.invalidSegment = 'input';
    return finishInvalid(base);
  }

  if (kind === 'company') {
    return validateCin(base, options);
  }
  if (kind === 'llp') {
    return validateLlpin(base);
  }

  base.errors.push('This does not match the expected shape of a 21-character CIN or a 7-character LLPIN.');
  base.segments = [{ key: 'input', label: 'Input', value: normalized.value, state: 'invalid' }];
  base.invalidSegment = 'input';
  base.subtitle = 'Expected a CIN (21 characters) or LLPIN (3 letters and 4 digits).';
  return finishInvalid(base);
}

function validateCin(base: IdentifierResult, options: ParseOptions): IdentifierResult {
  const value = base.normalizedInput;
  const characters = Array.from(value);
  const characterLength = characters.length;
  const currentYear = options.currentYear ?? new Date().getFullYear();
  const listing = characters[0] ?? '';
  const industry = characters.slice(1, 6).join('');
  const state = characters.slice(6, 8).join('');
  const year = characters.slice(8, 12).join('');
  const companyType = characters.slice(12, 15).join('');
  // Keep any overflow visible in the final chip when the CIN is too long.
  const registration = characters.slice(15).join('');

  base.title = 'Company CIN';
  base.subtitle = '21-character Corporate Identity Number';
  base.industryCode = industry || undefined;
  base.stateCode = state || undefined;
  base.stateName = stateCodes[state]?.name;
  base.companyType = companyType || undefined;
  base.companyTypeMeaning = companyTypeCodes[companyType]?.label;
  base.registrationNumber = registration || undefined;
  base.incorporationYear = /^\d{4}$/.test(year) ? Number(year) : undefined;
  base.listed = listing === 'L' ? true : listing === 'U' ? false : undefined;

  base.segments = [
    { key: 'listing', label: 'Listing', value: listing || '—', meaning: listing === 'L' ? 'Listed' : listing === 'U' ? 'Unlisted' : undefined },
    { key: 'industry', label: 'Industry', value: industry || '—', meaning: '5-digit activity code' },
    { key: 'state', label: 'State', value: state || '—', meaning: stateCodes[state]?.name },
    { key: 'year', label: 'Year', value: year || '—', meaning: /^\d{4}$/.test(year) ? `Incorporated ${year}` : undefined },
    { key: 'companyType', label: 'Type', value: companyType || '—', meaning: companyTypeCodes[companyType]?.label },
    { key: 'registration', label: 'ROC no.', value: registration || '—', meaning: '6-digit registration number' },
  ];

  if (characterLength !== CIN_LENGTH) {
    base.errors.push(`Length is ${characterLength} characters; expected ${CIN_LENGTH}.`);
    base.invalidSegment = 'input';
    return finishInvalid(base);
  }

  if (listing !== 'L' && listing !== 'U') {
    base.errors.push('Character 1 must be L (listed) or U (unlisted).');
    base.invalidSegment = 'listing';
    return finishInvalid(base);
  }

  if (!/^\d{5}$/.test(industry)) {
    const industryCharacters = Array.from(industry);
    const badIndex = industryCharacters.findIndex((character) => !/\d/.test(character));
    const absolutePosition = badIndex >= 0 ? badIndex + 2 : 2;
    const badCharacter = badIndex >= 0 ? industryCharacters[badIndex] : industry;
    const hint = badCharacter?.toUpperCase() === 'O' ? ' Did you mean the digit 0?' : '';
    base.errors.push(`Characters 2–6 must be digits. Character ${absolutePosition} is “${badCharacter}”.${hint}`);
    base.invalidSegment = 'industry';
    return finishInvalid(base);
  }

  if (!/^[A-Z]{2}$/.test(state)) {
    base.errors.push('Characters 7–8 must be a two-letter state or territory code.');
    base.invalidSegment = 'state';
    return finishInvalid(base);
  }

  const stateMapping = stateCodes[state];
  if (stateMapping) {
    base.stateName = stateMapping.name;
    const stateSegment = base.segments.find((segment) => segment.key === 'state');
    if (stateSegment) stateSegment.meaning = stateMapping.name;
    // Source notes document evidence; only medium-confidence mappings should
    // turn an otherwise correctly shaped CIN into a review result.
    if (stateMapping.confidence === 'medium') {
      const mappingNote = stateMapping.note
        ?? 'This abbreviation appears in an MCA state table, but this research set does not independently confirm its use in a CIN.';
      base.warnings.push(`${state}: ${mappingNote}`);
      if (stateSegment) stateSegment.state = 'warning';
    }
  } else {
    base.warnings.push(`State code ${state} has the correct two-letter shape but is not in this checker's researched mapping. Its meaning needs review.`);
    const stateSegment = base.segments.find((segment) => segment.key === 'state');
    if (stateSegment) stateSegment.state = 'warning';
  }

  if (!/^\d{4}$/.test(year)) {
    base.errors.push('Characters 9–12 must be a four-digit incorporation year.');
    base.invalidSegment = 'year';
    return finishInvalid(base);
  }

  const yearNumber = Number(year);
  base.incorporationYear = yearNumber;
  if (yearNumber > currentYear) {
    base.errors.push(`Incorporation year ${year} is in the future. The current year is ${currentYear}.`);
    base.invalidSegment = 'year';
    return finishInvalid(base);
  }
  if (yearNumber < MIN_PLAUSIBLE_INCORPORATION_YEAR) {
    base.warnings.push(`Year ${year} predates 1850, the earliest Indian legislation identified in the research for regulating registered joint-stock companies. Check this segment.`);
    const yearSegment = base.segments.find((segment) => segment.key === 'year');
    if (yearSegment) yearSegment.state = 'warning';
  }

  if (!/^[A-Z]{3}$/.test(companyType)) {
    base.errors.push('Characters 13–15 must be a three-letter company-type code.');
    base.invalidSegment = 'companyType';
    return finishInvalid(base);
  }

  const typeMapping = companyTypeCodes[companyType];
  if (typeMapping) {
    base.companyTypeMeaning = typeMapping.label;
    const typeSegment = base.segments.find((segment) => segment.key === 'companyType');
    if (typeSegment) typeSegment.meaning = typeMapping.label;
    if (typeMapping.confidence === 'conflicting') {
      base.warnings.push(`${companyType}: ${typeMapping.note ?? 'This code has conflicting meanings in government references.'}`);
      if (typeSegment) typeSegment.state = 'warning';
    } else if (typeMapping.note) {
      // A historical explanation is useful context, but is not uncertainty.
      // Keep it visible without changing a high-confidence mapping to review.
      base.information.push(`${companyType}: ${typeMapping.note}`);
    }
  } else {
    base.warnings.push(`Company-type code ${companyType} has the correct three-letter shape but is not in this checker's researched mapping. Its meaning needs review.`);
    const typeSegment = base.segments.find((segment) => segment.key === 'companyType');
    if (typeSegment) typeSegment.state = 'warning';
  }

  if (!/^\d{6}$/.test(registration)) {
    const badIndex = [...registration].findIndex((character) => !/\d/.test(character));
    const absolutePosition = badIndex >= 0 ? badIndex + 16 : 16;
    base.errors.push(`Characters 16–21 must be six digits. Character ${absolutePosition} is not a digit.`);
    base.invalidSegment = 'registration';
    return finishInvalid(base);
  }

  base.canonicalValue = value;
  return finishValid(base);
}

function validateLlpin(base: IdentifierResult): IdentifierResult {
  const value = base.normalizedInput;
  const compact = value.replace('-', '');
  const compactCharacters = Array.from(compact);
  const hasHyphen = value.includes('-');
  const hasMisplacedHyphen = hasHyphen && (value.indexOf('-') !== 3 || value.lastIndexOf('-') !== 3);
  base.title = 'Limited Liability Partnership';
  base.subtitle = 'LLPIN · 3-letter prefix and 4-digit number';
  // Do not canonicalise a misplaced hyphen: otherwise `AAA1-234` would
  // collide with the valid `AAA-1234` in duplicate detection.
  base.canonicalValue = hasMisplacedHyphen ? value : compact;

  const prefix = compactCharacters.slice(0, 3).join('');
  // Retain the full malformed tail so extra LLPIN characters are not hidden.
  const serial = compactCharacters.slice(3).join('');
  base.segments = [
    { key: 'llpinPrefix', label: 'LLPIN prefix', value: prefix || '—', meaning: '3 letters' },
    { key: 'llpinNumber', label: 'LLPIN number', value: serial || '—', meaning: '4 digits' },
  ];

  if (!/^[A-Z]{3}-?\d{4}$/.test(value)) {
    const characterLength = Array.from(value).length;
    if (characterLength !== LLPIN_LENGTH_WITHOUT_HYPHEN && characterLength !== LLPIN_LENGTH_WITHOUT_HYPHEN + 1) {
      base.errors.push(`Length is ${characterLength} characters; expected 7 characters (or 8 with the display hyphen).`);
      base.invalidSegment = 'input';
    } else if (!/^[A-Z]{3}/.test(value)) {
      base.errors.push('The first three LLPIN characters must be letters.');
      base.invalidSegment = 'llpinPrefix';
    } else if (hasMisplacedHyphen) {
      base.errors.push('The optional hyphen must appear immediately after the first three LLPIN letters.');
      base.segments = [{ key: 'input', label: 'Input', value, state: 'invalid' }];
      base.invalidSegment = 'input';
    } else {
      base.errors.push('The LLPIN must contain three letters followed by four digits, with an optional hyphen after the third letter.');
      base.invalidSegment = 'llpinNumber';
    }
    return finishInvalid(base);
  }

  if (!value.includes('-')) {
    base.normalizedInput = `${prefix}-${serial}`;
    base.normalizationNotes.push('LLPIN display hyphen inserted');
    base.isNormalized = true;
  }

  base.segments = [
    { key: 'llpinPrefix', label: 'Prefix', value: prefix, meaning: '3-letter LLP identifier prefix' },
    { key: 'llpinNumber', label: 'Number', value: serial, meaning: '4-digit LLP identifier number' },
  ];
  base.information.push('State, incorporation year, listing status and company type are not decoded from the LLPIN by this format checker.');
  return finishValid(base);
}

function finishInvalid(result: IdentifierResult): IdentifierResult {
  result.status = 'invalid';
  result.title = result.kind === 'company' ? 'Invalid CIN format' : result.kind === 'llp' ? 'Invalid LLPIN format' : 'Unrecognised identifier';
  result.subtitle = result.errors[0] ?? 'This entry needs attention.';
  if (result.invalidSegment) {
    result.segments = result.segments.map((segment) =>
      segment.key === result.invalidSegment ? { ...segment, state: 'invalid' } : segment,
    );
  }
  return result;
}

function finishValid(result: IdentifierResult): IdentifierResult {
  result.status = result.warnings.length > 0 ? 'valid-with-warnings' : 'valid';
  if (result.kind === 'company') {
    result.title = result.status === 'valid' ? 'Valid CIN format' : 'CIN format recognised';
    result.subtitle = result.status === 'valid'
      ? 'The identifier follows the expected CIN structure.'
      : 'The structure is recognised, but review the notes below.';
  } else {
    result.title = 'Valid LLPIN format';
    result.subtitle = 'The identifier follows the expected LLPIN structure.';
  }
  return result;
}

function classifyIdentifier(value: string): IdentifierKind {
  const characterLength = Array.from(value).length;
  // Distinguish a truncated CIN from an LLPIN by the prefix shape. Accept
  // alphanumeric fragments here so a typo (for example O instead of 0) still
  // receives a CIN length error. A three-letter LLPIN prefix or display hyphen
  // takes precedence because LLPINs may legitimately begin with L or U.
  if (characterLength === 7 || characterLength === 8) {
    const characters = Array.from(value);
    const looksLikeLlpinPrefix = /^[A-Z]{3}/.test(value) || value.includes('-');
    const activityFragment = characters.slice(1, 6);
    const activityDigitCount = activityFragment.filter((character) => /\d/.test(character)).length;
    const stateFragment = characters.slice(6);
    const hasStateLetters = stateFragment.length > 0 && stateFragment.every((character) => /^[A-Z]$/.test(character));
    const looksLikeTruncatedCin = (characters[0] === 'L' || characters[0] === 'U')
      && activityDigitCount >= 4
      && hasStateLetters;
    if (looksLikeTruncatedCin && !looksLikeLlpinPrefix) return 'company';
    return 'llp';
  }
  // 19–23 characters are likely CIN candidates; classifying by length gives
  // a useful exact-length message even when the first character is mistyped.
  if (characterLength >= 19 && characterLength <= 23) return 'company';
  if (/^[A-Z]{0,3}-?\d{0,4}$/.test(value) || /^[A-Z]{3}/.test(value)) return 'llp';
  if (value.startsWith('L') || value.startsWith('U')) return 'company';
  return 'unknown';
}

export function validateIdentifier(rawInput: string, options: ParseOptions = {}): IdentifierResult {
  const normalized = normalizeIdentifier(rawInput);
  const kind = classifyIdentifier(normalized.value);
  return makeResult(1, rawInput, normalized, kind, options);
}

export function parseIdentifierList(text: string, options: ParseOptions = {}): IdentifierListResult {
  // Newlines define entries. For tab-delimited spreadsheet rows, keep cells
  // that resemble CINs/LLPINs and ignore adjacent company-name/description cells.
  // If a tabbed row contains no identifier-like cell, retain its cells as
  // ordinary input so malformed values are still explained to the user.
  const lines = text.split(/\r\n|\n|\r/);
  const rawEntries: string[] = [];
  let ignoredNonIdentifierCells = 0;
  for (const line of lines) {
    const cells = line.includes('\t') ? line.split('\t') : [line];
    if (isSpreadsheetHeaderRow(cells)) {
      ignoredNonIdentifierCells += cells.length;
      continue;
    }
    if (!line.includes('\t')) {
      rawEntries.push(line);
      continue;
    }
    const identifierCells = cells.filter(isIdentifierLikeCell);
    if (identifierCells.length > 0) {
      ignoredNonIdentifierCells += cells.length - identifierCells.length;
      rawEntries.push(...identifierCells);
    } else {
      rawEntries.push(...cells);
    }
  }

  const requestedMaxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const maxEntries = Number.isFinite(requestedMaxEntries)
    ? Math.max(1, Math.floor(requestedMaxEntries))
    : DEFAULT_MAX_ENTRIES;
  const selected: Array<{ raw: string; entryNumber: number; normalized: NormalizedValue }> = [];
  let totalEntries = 0;
  let ignoredBlankEntries = 0;

  rawEntries.forEach((raw, index) => {
    const normalized = normalizeIdentifier(raw);
    if (!normalized.value) {
      ignoredBlankEntries += 1;
      return;
    }
    totalEntries += 1;
    if (selected.length < maxEntries) {
      selected.push({ raw, entryNumber: index + 1, normalized });
    }
  });

  const seen = new Map<string, number>();
  const results = selected.map(({ raw, entryNumber, normalized }) => {
    const result = makeResult(entryNumber, raw, normalized, classifyIdentifier(normalized.value), options);
    const key = result.canonicalValue;
    const previousEntry = seen.get(key);
    if (previousEntry !== undefined) {
      result.duplicateOfEntry = previousEntry;
      result.warnings.push(`Duplicate of entry ${previousEntry}.`);
      if (result.status !== 'invalid') {
        result.status = 'valid-with-warnings';
        result.title = result.kind === 'company' ? 'Duplicate CIN entry' : 'Duplicate LLPIN entry';
        result.subtitle = `This identifier also appears in entry ${previousEntry}. Review duplicate entries before using the list.`;
      }
    } else {
      seen.set(key, entryNumber);
    }
    return result;
  });

  const truncatedEntries = Math.max(0, totalEntries - selected.length);
  return {
    results,
    totalEntries,
    processedEntries: results.length,
    ignoredBlankEntries,
    ignoredNonIdentifierCells,
    truncatedEntries,
    limitExceeded: truncatedEntries > 0,
  };
}

export function toCsv(results: IdentifierResult[]): string {
  const headers = [
    'Entry', 'Original input', 'Normalised identifier', 'Kind', 'Result', 'Listing status',
    'State', 'Incorporation year', 'Company type', 'Company type code', 'Industry code', 'Registration number',
    'Errors', 'Warnings', 'Information', 'Duplicate of entry',
  ];
  const rows = results.map((result) => [
    String(result.entryNumber),
    result.rawInput,
    result.normalizedInput,
    result.kind,
    result.status,
    result.listed === undefined ? (result.kind === 'llp' ? 'Not encoded in LLPIN' : 'Not decoded') : result.listed ? 'Listed' : 'Unlisted',
    result.stateName ?? (result.kind === 'llp' ? 'Not encoded in LLPIN' : result.stateCode ? `Unmapped (${result.stateCode})` : 'Not mapped'),
    result.incorporationYear === undefined ? (result.kind === 'llp' ? 'Not encoded in LLPIN' : 'Not decoded') : String(result.incorporationYear),
    result.companyTypeMeaning ?? (result.kind === 'llp' ? 'Not encoded in LLPIN' : result.companyType ? `Unmapped (${result.companyType})` : 'Not mapped'),
    result.companyType ?? '',
    result.industryCode ?? '',
    result.registrationNumber ?? '',
    result.errors.join(' | '),
    result.warnings.join(' | '),
    result.information.join(' | '),
    result.duplicateOfEntry === undefined ? '' : String(result.duplicateOfEntry),
  ]);

  const escapeCell = (cell: string, columnIndex: number) => {
    // Excel otherwise drops leading zeroes from numeric-looking code columns.
    // Formula wrappers are generated only for digit-only industry / registration
    // segments. User-controlled text continues to receive formula-injection protection.
    const isCodeColumn = columnIndex === 10 || columnIndex === 11;
    const preserveLeadingZero = isCodeColumn && /^0\d+$/.test(cell);
    const safeCell = preserveLeadingZero
      ? `="${cell}"`
      : /^[\s]*[=+@-]/.test(cell) ? `'${cell}` : cell;
    return /[",\r\n]/.test(safeCell) ? `"${safeCell.replace(/"/g, '""')}"` : safeCell;
  };
  return [headers, ...rows].map((row) => row.map((cell, index) => escapeCell(cell, index)).join(',')).join('\r\n');
}
