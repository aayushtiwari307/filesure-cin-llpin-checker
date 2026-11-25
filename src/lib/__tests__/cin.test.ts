import { describe, expect, it } from 'vitest';
import { realCinFixtures, realLlpinFixtures } from '../../data/realFixtures';
import { parseIdentifierList, toCsv, validateIdentifier } from '../cin';

const ril = 'L17110MH1973PLC019786';

describe('CIN validation', () => {
  it('decodes the six CIN segments', () => {
    const result = validateIdentifier(ril, { currentYear: 2026 });
    expect(result.kind).toBe('company');
    expect(result.status).toBe('valid');
    expect(result.listed).toBe(true);
    expect(result.stateName).toBe('Maharashtra');
    expect(result.incorporationYear).toBe(1973);
    expect(result.companyType).toBe('PLC');
    expect(result.companyTypeMeaning).toContain('Public limited');
    expect(result.segments.map((segment) => segment.value)).toEqual(['L', '17110', 'MH', '1973', 'PLC', '019786']);
  });

  it.each(['L17110MH1973PLC01978', 'L17110MH1973PLC0197860'])('reports the exact length for %s', (identifier) => {
    const result = validateIdentifier(identifier, { currentYear: 2026 });
    expect(result.status).toBe('invalid');
    expect(result.kind).toBe('company');
    expect(result.errors[0]).toContain(`Length is ${identifier.length} characters; expected 21`);
  });

  it('keeps an extra CIN character visible in the final segment chip', () => {
    const result = validateIdentifier('L17110MH1973PLC0197860', { currentYear: 2026 });
    expect(result.status).toBe('invalid');
    expect(result.segments.at(-1)?.value).toBe('0197860');
  });

  it('still reports a CIN length error when its first character is mistyped', () => {
    const result = validateIdentifier(`X${ril.slice(1, -1)}`, { currentYear: 2026 });
    expect(result.kind).toBe('company');
    expect(result.errors[0]).toContain('Length is 20 characters; expected 21');
  });

  it('explains an invalid listing character', () => {
    const result = validateIdentifier(`X${ril.slice(1)}`);
    expect(result.errors[0]).toContain('Character 1 must be L (listed) or U (unlisted)');
    expect(result.invalidSegment).toBe('listing');
  });

  it('points out O versus 0 in the industry segment', () => {
    const result = validateIdentifier('L17O10MH1973PLC019786');
    expect(result.errors[0]).toContain('Character 4 is “O”');
    expect(result.errors[0]).toContain('Did you mean the digit 0?');
    expect(result.invalidSegment).toBe('industry');
  });

  it('keeps a non-BMP invalid character intact in the industry error', () => {
    const result = validateIdentifier('L😀7110MH1973PLC019786');
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toContain('“😀”');
  });

  it('keeps unknown but well-shaped state codes reviewable, not malformed', () => {
    const result = validateIdentifier('L17110XX1973PLC019786');
    expect(result.status).toBe('valid-with-warnings');
    expect(result.errors).toHaveLength(0);
    expect(result.warnings[0]).toContain('State code XX');
    expect(toCsv([result])).toContain('Unmapped (XX)');
  });

  it('accepts evidence-based state aliases and flags medium-confidence mappings', () => {
    for (const state of ['TG', 'TS', 'CT', 'CG', 'OR', 'OD', 'UR', 'UT', 'UK', 'PY', 'LA', 'AP', 'DH', 'DD', 'DN']) {
      const result = validateIdentifier(`L17110${state}1973PLC019786`, { currentYear: 2026 });
      expect(result.status).not.toBe('invalid');
      expect(result.stateName).toBeDefined();
      if (['TS', 'CG', 'OD', 'UK', 'UT', 'PY', 'LA', 'AP', 'DH', 'DD'].includes(state)) {
        expect(result.status).toBe('valid-with-warnings');
        expect(result.segments.find((segment) => segment.key === 'state')?.state).toBe('warning');
      }
    }
  });

  it('decodes UR as Uttarakhand from a government-published company CIN', () => {
    const result = validateIdentifier('U40109UR2001SGC025867', { currentYear: 2026 });
    expect(result.status).toBe('valid');
    expect(result.stateCode).toBe('UR');
    expect(result.stateName).toBe('Uttarakhand');
    expect(result.companyTypeMeaning).toBe('State Government company');
  });

  it('resolves the state name for every sourced CIN fixture', () => {
    for (const fixture of realCinFixtures) {
      const result = validateIdentifier(fixture.identifier, { currentYear: 2026 });
      expect(result.stateName, `${fixture.name} (${fixture.identifier})`).toBeDefined();
    }
  });

  it('does not turn high-confidence CIN state evidence notes into review warnings', () => {
    for (const state of ['CT', 'OR', 'TG', 'DN']) {
      const result = validateIdentifier(`L17110${state}1973PLC019786`, { currentYear: 2026 });
      expect(result.status).toBe('valid');
      expect(result.segments.find((segment) => segment.key === 'state')?.state).toBeUndefined();
    }
  });

  it('flags a future incorporation year as invalid', () => {
    const result = validateIdentifier('L17110MH2099PLC019786', { currentYear: 2026 });
    expect(result.errors[0]).toContain('2099 is in the future');
    expect(result.invalidSegment).toBe('year');
  });

  it('warns rather than silently rewriting a pre-1850 year', () => {
    const result = validateIdentifier('L17110MH1700PLC019786', { currentYear: 2026 });
    expect(result.status).toBe('valid-with-warnings');
    expect(result.warnings[0]).toContain('predates 1850');
  });

  it('does not warn on the 1850 lower-bound year', () => {
    const result = validateIdentifier('L17110MH1850PLC019786', { currentYear: 2026 });
    expect(result.status).toBe('valid');
  });

  it('accepts a six-digit registration segment without inventing a check digit', () => {
    const result = validateIdentifier('L17110MH1973PLC000000', { currentYear: 2026 });
    expect(result.status).toBe('valid');
  });

  it('does not invent the meaning of FLC', () => {
    const result = validateIdentifier('L17110MH1973FLC019786', { currentYear: 2026 });
    expect(result.status).toBe('valid-with-warnings');
    expect(result.companyType).toBe('FLC');
    expect(result.companyTypeMeaning).toContain('disputed');
    expect(result.warnings[0]).toContain('MoSPI');
  });

  it('names the disputed company-type code in its warning', () => {
    const result = validateIdentifier('L17110MH1973FLC019786', { currentYear: 2026 });
    expect(result.warnings[0]).toMatch(/^FLC:/);
  });

  it('describes NPL as not-for-profit while preserving Section 25 / Section 8 context', () => {
    const result = validateIdentifier('U85500MH2024NPL433965', { currentYear: 2026 });
    expect(result.status).toBe('valid');
    expect(result.companyTypeMeaning).toContain('Not-for-profit company');
    expect(result.companyTypeMeaning).toContain('Section 8');
    expect(result.information.join(' ')).toContain('Section 25');
    expect(result.information.join(' ')).toContain('Angel One Foundation');
    expect(result.warnings).toHaveLength(0);
    expect(result.segments.find((segment) => segment.key === 'companyType')?.state).toBeUndefined();
  });

  it('does not reject an unfamiliar ownership code on shape alone', () => {
    const result = validateIdentifier('L17110MH1973ZZZ019786', { currentYear: 2026 });
    expect(result.status).toBe('valid-with-warnings');
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.join(' ')).toContain('ZZZ');
  });

  it('reports a non-digit registration character', () => {
    const result = validateIdentifier('L17110MH1973PLC01978A');
    expect(result.errors[0]).toContain('Characters 16–21 must be six digits');
    expect(result.invalidSegment).toBe('registration');
  });

  it('accepts all sourced CIN fixtures as structurally readable', () => {
    for (const fixture of realCinFixtures) {
      const result = validateIdentifier(fixture.identifier, { currentYear: 2026 });
      expect(result.status, `${fixture.name} (${fixture.identifier})`).not.toBe('invalid');
      expect(result.stateName, `${fixture.name} (${fixture.identifier}) state mapping`).toBeDefined();
    }
  });
});

describe('LLPIN validation', () => {
  it('recognises a hyphenated LLPIN without claiming encoded metadata', () => {
    const result = validateIdentifier('AAA-1234');
    expect(result.kind).toBe('llp');
    expect(result.status).toBe('valid');
    expect(result.listed).toBeUndefined();
    expect(result.stateName).toBeUndefined();
    expect(result.information.join(' ')).toContain('not decoded from the LLPIN');
    expect(toCsv([result])).toContain('Not encoded in LLPIN');
    expect(toCsv([result])).not.toContain('Not applicable to LLPIN');
  });

  it('adds the display hyphen when omitted', () => {
    const result = validateIdentifier('AAA1234');
    expect(result.normalizedInput).toBe('AAA-1234');
    expect(result.isNormalized).toBe(true);
  });

  it('recognises an LLPIN whose three-letter prefix begins with L or U', () => {
    expect(validateIdentifier('LAA-1234').kind).toBe('llp');
    expect(validateIdentifier('UAA-1234').kind).toBe('llp');
    expect(validateIdentifier('U1A-1234').kind).toBe('llp');
    expect(validateIdentifier('U1A1234').kind).toBe('llp');
  });

  it('classifies 7/8-character CIN prefixes as truncated CINs', () => {
    const sevenCharacterPrefix = validateIdentifier('L17110M');
    const eightCharacterPrefix = validateIdentifier('L17110MH');
    expect(sevenCharacterPrefix.kind).toBe('company');
    expect(sevenCharacterPrefix.errors[0]).toContain('Length is 7 characters; expected 21.');
    expect(eightCharacterPrefix.kind).toBe('company');
    expect(eightCharacterPrefix.errors[0]).toContain('Length is 8 characters; expected 21.');
  });

  it('keeps short CIN candidates classified as CINs when an industry digit is mistyped', () => {
    const letterO = validateIdentifier('L17O10M');
    const otherLetter = validateIdentifier('L17A10MH');
    expect(letterO.kind).toBe('company');
    expect(letterO.errors[0]).toContain('expected 21');
    expect(otherLetter.kind).toBe('company');
    expect(otherLetter.errors[0]).toContain('expected 21');
  });

  it('rejects an invalid LLPIN prefix and highlights only that segment', () => {
    const result = validateIdentifier('AA1-1234');
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toContain('first three LLPIN characters must be letters');
    expect(result.segments.map((segment) => segment.state)).toEqual(['invalid', undefined]);
  });

  it('preserves emoji as one code point in an invalid LLPIN prefix segment', () => {
    const result = validateIdentifier('😀AA-1234');
    expect(result.status).toBe('invalid');
    expect(result.segments[0].value).toBe('😀AA');
    expect(Array.from(result.segments[0].value)).toHaveLength(3);
  });

  it('rejects an invalid LLPIN serial and highlights only the number segment', () => {
    const result = validateIdentifier('AAA-12A4');
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toContain('three letters followed by four digits');
    expect(result.segments.map((segment) => segment.state)).toEqual([undefined, 'invalid']);
  });

  it('keeps an overlong LLPIN serial tail visible instead of truncating it', () => {
    const result = validateIdentifier('AAA-12345');
    expect(result.status).toBe('invalid');
    expect(result.segments[1].value).toBe('12345');
    expect(result.errors[0]).toContain('Length is 9 characters');
  });

  it('does not accept a misplaced LLPIN hyphen as a valid serial', () => {
    const result = validateIdentifier('AAA1-234');
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toContain('immediately after the first three LLPIN letters');
    expect(result.segments).toEqual([{ key: 'input', label: 'Input', value: 'AAA1-234', state: 'invalid' }]);
  });

  it('accepts all sourced LLPIN fixtures', () => {
    for (const fixture of realLlpinFixtures) {
      const result = validateIdentifier(fixture.identifier);
      expect(result.status, `${fixture.name} (${fixture.identifier})`).not.toBe('invalid');
    }
  });
});

describe('normalisation and batch parsing', () => {
  it('normalises lowercase, surrounding whitespace and a trailing comma', () => {
    const result = validateIdentifier(`  "${ril.toLowerCase()},"  `);
    expect(result.normalizedInput).toBe(ril);
    expect(result.isNormalized).toBe(true);
  });

  it('removes Excel-style tabs pasted inside one identifier', () => {
    const result = validateIdentifier(`${ril.slice(0, 10)}\t${ril.slice(10)}`, { currentYear: 2026 });
    expect(result.normalizedInput).toBe(ril);
    expect(result.isNormalized).toBe(true);
  });

  it('treats tab-separated Excel cells as separate batch entries', () => {
    const result = parseIdentifierList(`${ril}\tAAA-1234\r\nL74140MH2008PLC177884`);
    expect(result.totalEntries).toBe(3);
    expect(result.results.map((entry) => entry.normalizedInput)).toEqual([ril, 'AAA-1234', 'L74140MH2008PLC177884']);
    expect(result.results.map((entry) => entry.entryNumber)).toEqual([1, 2, 3]);
  });

  it('gives a specific error when multiple identifiers are pasted on one line', () => {
    const second = 'U40108CT2003SGC015822';
    const result = validateIdentifier(`${ril}, ${second}`, { currentYear: 2026 });
    expect(result.status).toBe('invalid');
    expect(result.title).toBe('Multiple identifiers on one line');
    expect(result.errors[0]).toContain('Put each CIN or LLPIN on a separate line');
  });

  it('keeps multiple identifiers on one physical batch line as one actionable invalid row', () => {
    const result = parseIdentifierList(`${ril} U40108CT2003SGC015822`, { currentYear: 2026 });
    expect(result.totalEntries).toBe(1);
    expect(result.results[0].title).toBe('Multiple identifiers on one line');
    expect(result.results[0].errors[0]).toContain('Put each CIN or LLPIN on a separate line');
  });

  it('ignores spreadsheet headers and adjacent company-name cells in tab-delimited rows', () => {
    const result = parseIdentifierList(`Company Name\tCIN\r\nReliance Industries Limited\t${ril}\r\nAngel One Foundation\tU85500MH2024NPL433965`);
    expect(result.totalEntries).toBe(2);
    expect(result.processedEntries).toBe(2);
    expect(result.ignoredNonIdentifierCells).toBe(4);
    expect(result.results.map((entry) => entry.normalizedInput)).toEqual([ril, 'U85500MH2024NPL433965']);
  });

  it('ignores a standalone spreadsheet CIN header', () => {
    const result = parseIdentifierList(`CIN\n${ril}`);
    expect(result.totalEntries).toBe(1);
    expect(result.ignoredNonIdentifierCells).toBe(1);
    expect(result.results[0].normalizedInput).toBe(ril);
  });

  it('normalises a quoted CSV value followed by a trailing comma', () => {
    const result = validateIdentifier(`\"${ril}\",`);
    expect(result.normalizedInput).toBe(ril);
    expect(result.status).toBe('valid');
  });

  it('does not silently remove more than one trailing comma', () => {
    const result = validateIdentifier(`${ril},,`, { currentYear: 2026 });
    expect(result.status).toBe('invalid');
    expect(result.errors[0]).toContain('expected 21');
  });

  it('does not remove arbitrary punctuation from an identifier', () => {
    const result = validateIdentifier('L17110-MH1973PLC019786');
    expect(result.status).toBe('invalid');
  });

  it('ignores blank lines and handles Windows line endings', () => {
    const result = parseIdentifierList(`\r\n${ril}\r\n\r\nAAA-1234\r\n`);
    expect(result.totalEntries).toBe(2);
    expect(result.ignoredBlankEntries).toBe(3);
    expect(result.results.map((entry) => entry.entryNumber)).toEqual([2, 4]);
  });

  it('flags duplicates after normalisation but preserves both rows', () => {
    const result = parseIdentifierList(`${ril}\n${ril.toLowerCase()}\nAAA1234\nAAA-1234`);
    expect(result.results).toHaveLength(4);
    expect(result.results[1].duplicateOfEntry).toBe(1);
    expect(result.results[1].title).toBe('Duplicate CIN entry');
    expect(result.results[3].duplicateOfEntry).toBe(3);
    expect(result.results[3].title).toBe('Duplicate LLPIN entry');
  });

  it('does not treat a malformed hyphen position as a duplicate LLPIN', () => {
    const result = parseIdentifierList('AAA-1234\nAAA1-234');
    expect(result.results[0].status).toBe('valid');
    expect(result.results[1].status).toBe('invalid');
    expect(result.results[1].duplicateOfEntry).toBeUndefined();
  });

  it('does not canonicalise a double-hyphen LLPIN into a valid identifier', () => {
    const result = parseIdentifierList('AAA-1234\nAAA--1234');
    expect(result.results[0].status).toBe('valid');
    expect(result.results[1].status).toBe('invalid');
    expect(result.results[1].duplicateOfEntry).toBeUndefined();
    expect(result.results[1].canonicalValue).toBe('AAA--1234');
    expect(result.results[1].errors[0]).toContain('Length is 9 characters; expected 7 characters (or 8 with the display hyphen).');
    const misplacedWithinLength = validateIdentifier('AAA--123');
    expect(misplacedWithinLength.errors[0]).toContain('immediately after the first three LLPIN letters');
  });

  it('handles emoji as invalid input without throwing', () => {
    const result = validateIdentifier('😀L17110MH1973PLC019786');
    expect(result.status).toBe('invalid');
  });

  it('processes a 500-line paste without dropping entries', () => {
    const result = parseIdentifierList(Array.from({ length: 500 }, () => ril).join('\n'));
    expect(result.processedEntries).toBe(500);
    expect(result.truncatedEntries).toBe(0);
  });

  it('enforces the 5,000-entry cap and reports truncation', () => {
    const result = parseIdentifierList(Array.from({ length: 5_003 }, () => ril).join('\n'));
    expect(result.processedEntries).toBe(5_000);
    expect(result.truncatedEntries).toBe(3);
    expect(result.limitExceeded).toBe(true);
  });

  it('normalises a caller-supplied entry limit to a positive integer', () => {
    const result = parseIdentifierList([ril, ril, ril].join('\n'), { maxEntries: 1.8 });
    expect(result.processedEntries).toBe(1);
    expect(result.truncatedEntries).toBe(2);
  });

  it('escapes CSV values containing commas, quotes and newlines', () => {
    const result = validateIdentifier(ril);
    result.rawInput = '"Example, ""quoted"" company\nidentifier"';
    const csv = toCsv([result]);
    expect(csv).toContain('\"\"\"Example, \"\"\"\"quoted\"\"\"\" company\nidentifier\"\"\"');
  });

  it('preserves leading zeroes in industry and registration code columns for Excel', () => {
    const result = validateIdentifier('L01110MH1973PLC000123', { currentYear: 2026 });
    const csv = toCsv([result]);
    expect(csv).toContain('=\"\"01110\"\"');
    expect(csv).toContain('=\"\"000123\"\"');
  });

  it('protects formula-leading user input in CSV exports', () => {
    const result = validateIdentifier('=HYPERLINK(\"https://example.com\")');
    const csv = toCsv([result]);
    expect(csv).toContain('\"\'=HYPERLINK(');
  });
});
