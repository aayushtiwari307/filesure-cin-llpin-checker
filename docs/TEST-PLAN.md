# Test Plan — CIN & LLPIN Checker

This is the test-first checklist for P2 and later UI QA. “Valid format” means only that the identifier fits the documented structure and the checker can safely interpret the fields; it does not prove registry existence or current status.

## Parser and normalisation

| ID | Input / scenario | Expected behaviour |
|---|---|---|
| N01 | Lowercase CIN | Uppercase, mark normalised, parse same segments |
| N02 | Leading and trailing spaces | Trim, mark normalised |
| N03 | CRLF Windows line endings | Split entries correctly |
| N04 | Tabs / non-breaking spaces around identifier | Remove presentation whitespace safely |
| N05 | Zero-width formatting character | Remove only the known zero-width formatting character and mark normalised |
| N06 | One trailing comma / surrounding quotes | Remove safe CSV-style wrapper and mark normalised |
| N07 | Blank lines | Ignore for totals; do not show as invalid entries |
| N08 | LLPIN without hyphen (`AAA1234`) | Recognise; display `AAA-1234`; mark normalised |
| N09 | Arbitrary interior punctuation | Do not silently delete; report malformed input |

## CIN structure and segment errors

| ID | Input / scenario | Expected behaviour |
|---|---|---|
| C01 | Valid 21-character CIN | Split into six segment chips |
| C02 | 20 characters | Exact length error |
| C03 | 22 characters | Exact length error |
| C04 | First char not L/U | Highlight listing segment and explain allowed values |
| C05 | Letter O in five-digit activity code | Highlight the digit segment; identify O/0 confusion where position is known |
| C06 | Non-letter state characters | Highlight state segment and explain it must be two letters |
| C07 | Unknown two-letter state code | Keep structural format separate; show unmapped / needs review, not fabricated state |
| C15 | Uttarakhand `UR` CIN (`U40109UR2001SGC025867`) | Resolve state name to Uttarakhand with high confidence |
| C16 | Every sourced CIN fixture | Assert a state name resolves, not merely that the result is not invalid |
| C08 | Future incorporation year | Invalid future-year message using injected reference year |
| C09 | Year 1700 | Plausibility error/warning based on pre-1850 company-law history |
| C10 | Year exactly 1850 | Do not reject on lower-bound rule |
| C11 | Unknown ownership code | Keep the identifier shape visible; show unmapped / needs review |
| C12 | FLC | Show explicit conflicting-reference warning; do not guess meaning |
| C13 | Non-digit final registration segment | Exact error and highlighted segment |
| C14 | All-zero 6-digit registration segment | No invented check-digit rule; accept shape and disclose no allotment lookup |

## LLPIN structure

| ID | Input / scenario | Expected behaviour |
|---|---|---|
| L01 | `AAA-1234` | Recognise as LLPIN format |
| L02 | `AAA1234` | Display hyphen and mark normalised |
| L03 | Four letters / three digits | Reject with exact format explanation |
| L04 | `AA1-1234` | Reject; prefix must be three letters |
| L05 | LLPIN result fields | Listed status, state, year and company type say “Not encoded in LLPIN” |

## Batch, duplicates, export and UI

| ID | Scenario | Expected behaviour |
|---|---|---|
| B01 | Same CIN repeated with different case/spacing | Detect duplicate after normalisation; keep both entries |
| B02 | Mix CIN, LLPIN, invalid strings and blank lines | Only non-empty rows counted; one result per non-empty entry |
| B03 | Emoji / unexpected Unicode | No crash; clear invalid-character explanation |
| B04 | 500 entries | Results render and filters work without freezing |
| B05 | More than 5,000 non-empty entries | Clear cap message; never silently discard without explanation |
| B06 | Rapid editing while debounce runs | Latest input wins; no stale output |
| B07 | Copy results | Clipboard text includes useful labels and warnings |
| B08 | CSV quoting, comma, quote and newline fields | Proper RFC-style escaping; valid CSV |
| B09 | Formula-leading pasted value exported to CSV | Prefix formula-leading user text so spreadsheet software does not evaluate it as a formula |
| B10 | Filter All / Invalid / Review | Counts remain for full input; list filter is clear |
| B11 | CSV after selecting a filter | Export only the active filtered result set; disable when empty |
| B12 | Misplaced hyphen in an LLPIN next to a valid value | Do not report a false duplicate after canonicalisation |
| B13 | Two CIN / LLPIN-like tokens on one physical line | Give a specific one-identifier-per-line message |
| B14 | Spreadsheet header row (`Company Name<TAB>CIN`) | Skip the header and count ignored non-identifier cells |
| B15 | Excel CSV opens numeric-looking code columns | Preserve leading zeroes for industry and registration codes |
| B16 | Duplicate entries in a batch | Keep duplicates in Review and expose a separate duplicate count |
| V12 | 7/8-character CIN prefix (`L17110M`, `L17110MH`) | Report truncated CIN length, not malformed LLPIN |
| V13 | LLPIN prefix beginning L/U, including malformed `U1A-1234` | Keep LLPIN classification and highlight the prefix |
| V14 | Emoji inside CIN industry / LLPIN prefix | Preserve the full Unicode character in the error / segment display |
| U03 | CSV while Invalid / Review filter is active | Export only the currently filtered results; disable if empty |
| A01 | Keyboard-only use | All controls reachable and focused visibly |
| A02 | Screen reader | Summary and copy status announced via `aria-live`; segment chips exposed as named groups |
| A03 | Uttarakhand `UR` result | Result card displays Uttarakhand, not an unmapped state |
| R01 | 360px viewport | No horizontal overflow; inputs and result cards remain readable |
| R02 | Desktop laptop width | Two-column layout; results scan cleanly |

## Sourced fixture policy

- Real examples live in `src/data/realFixtures.ts` and include their source URL and label.
- Synthetic values may be used in unit tests for malformed shapes and boundary conditions, but must never be labelled as real company/LLP records.
- A passing fixture test demonstrates that the parser can interpret a published example. It does not prove that the entity is currently active or that MCA would allot the same identifier today.


## Independent checks (24 November 2026)

The standalone validation engine and research fixture modules were strictly compiled with TypeScript 5.8.3. The pre-review independent Node.js runtime audit passed 29 check groups, including the then-current 37 sourced CIN fixtures and 25 sourced LLPIN fixtures. Checks covered segment decoding, listed/unlisted status, malformed lengths and segments, unknown and medium-confidence mappings, high-confidence state evidence, NPL/FLC handling, the directly evidenced `DN` CIN code, LLPIN normalisation and error highlighting, malformed multi-hyphen duplicate handling, overlong-segment visibility, duplicates, Excel tab-separated cells, Unicode/emoji preservation, the 5,000-entry cap, and CSV quoting/formula-injection protection.

Parser-only performance smoke tests completed in approximately 5 ms for 500 entries and 33 ms for 5,000 entries in the build container (Node.js 22.16.0). These timings do not measure React rendering or a user's device.

The source files were syntax-transpiled with zero syntax diagnostics, and TypeScript project-reference configuration was checked in build dry-run mode. The Vitest setup explicitly registers React Testing Library cleanup because Vitest globals are disabled. A final regression pass also checks that high-confidence NPL context is informational, short malformed CIN prefixes are classified more carefully, unknown state codes are preserved in CSV, fractional caller-supplied limits are clamped, and batch labels use entry terminology for tab-separated inputs. After the independent review, the source-level TypeScript compile and seven targeted Node.js checks passed for the new `UR`, spreadsheet-header, multi-identifier, NPL, duplicate, and Excel-zero cases. The full dependency-backed Vitest suite, project typecheck, production build, and audit must be rerun on the Windows release candidate after applying this patch. Actual browser rendering, physical-device checks, clipboard behaviour, and downloads should remain part of local release QA.
