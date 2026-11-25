# FileSure CIN & LLPIN Checker — Product Specification

**Status:** P1 research complete; P2 validation engine, P3 responsive UI, and P4 interaction features implemented in source. Package-level Vitest/build checks remain to be run in the project environment.

## 1. Product goal

Build a fast, browser-only checker that helps a first-time visitor understand the structure of multiple Indian Corporate Identity Numbers (CINs) and Limited Liability Partnership Identification Numbers (LLPINs). The product is a format explainer, not an MCA existence or status-verification service.

## 2. Primary users

- Chartered Accountants and company secretaries
- Lawyers and compliance professionals
- Business owners and people reviewing company records

The interface must be understandable without instructions and remain useful on a 360px-wide phone and a desktop screen.

## 3. Required output per non-empty input line

| Field | Company CIN | LLPIN |
|---|---|---|
| Result | Valid / valid with review warnings / invalid | Same |
| Entity kind | Company | LLP |
| Listed status | `L` = listed; `U` = unlisted | Not encoded in LLPIN |
| State | Decode when a researched mapping is available; otherwise needs review | Not decoded by this format checker |
| Incorporation year | Four-digit segment, with conservative plausibility handling | Not decoded by this format checker |
| Company type | Decode when a researched mapping is available; otherwise needs review | Not encoded in LLPIN |
| Explanation | Exact structural issue or transparent mapping warning | Exact structural issue and encoding limitation |

Unknown metadata must not automatically turn a structurally well-formed identifier into a malformed one.

## 4. CIN structure

The Government of India's Ministry of Statistics and Programme Implementation (MoSPI) ASI 2023–24 Instruction Manual and FIU-IND FINGate manual describe a 21-character CIN as six segments:

1. 1 character: listing status (`L` / `U`)
2. 5 digits: industry / economic activity code
3. 2 letters: state / territory segment
4. 4 digits: incorporation year
5. 3 letters: company classification / ownership code
6. 6 digits: ROC-wise registration number

The five-digit industry code is shown but not decoded by this tool. See [research and sources](./docs/RESEARCH.md).

## 5. State and company-type mappings

The mapping dictionaries are maintained separately from the validation engine in `src/data/researchMappings.ts`. Confidence and caveats are stored alongside entries. Historical/state-abbreviation conflicts are explicitly documented; examples supported by CIN records include `TG`, `CT`, `OR`, and the merged-territory `DN`, while general MCA abbreviation tables also contain `TS`, `CG`, and `OD`. `UK` and `UT` are retained with caveats. A correctly shaped but unmapped two-letter state code is shown as needing review, not automatically rejected.

Company-type meanings are shown only where supported by the collected government references or official records. The `FLC` meaning is disputed between MoSPI and FIU-IND; the interface must show that conflict instead of choosing a definition. Unknown three-letter codes are review warnings, not proof of malformed format.

## 6. LLPIN scope

The checker recognises three letters followed by four digits, displayed with an optional hyphen after the third letter. If the hyphen is omitted, it is inserted for display and marked as normalised. The researched sources do not establish a reliable state, year, listing-status, or company-type decoding scheme from the LLPIN segments; those fields are explicitly shown as not decoded by this format checker.

## 7. Validation versus verification

A local format checker can identify whether an input fits the documented structural rules and whether individual segments map to known values. It cannot establish from format alone that an LLP/company exists, is active, or is authentic. This project does not make live MCA requests.

## 8. Input handling

- One identifier per line; tab-separated spreadsheet cells are also treated as separate entries.
- Trim outer whitespace, normalise case, remove known zero-width/non-breaking formatting characters, horizontal whitespace, a single trailing comma, and balanced wrapping quotes.
- Do not delete arbitrary punctuation or interior characters.
- Insert the LLPIN display hyphen where omitted and disclose normalisation.
- Ignore blank lines for result totals.
- Detect duplicates after safe normalisation while retaining every row.
- Process up to 5,000 non-empty entries and report any entries beyond the cap.

## 9. Results and interaction

- Live results with a short debounce; no separate Check button.
- Segment chips for CINs, with the offending segment visually identified. Length errors highlight the complete segment row.
- Summary counts for total, valid, review warnings, and invalid.
- All / Invalid / Review filters.
- Copy visible results and Download CSV with proper CSV escaping.
- Try example and Clear actions.
- Designed empty, malformed-input, and large-input states.

## 10. Design direction

A calm, light professional interface with a restrained FileSure-inspired purple accent, ink-dark typography, muted borders, subtle success/warning/error states, and monospaced identifier segments. Avoid a generic dashboard aesthetic, excessive gradients, decorative charts, and needless animation. Colour must never be the only validity cue.

## 11. Technical decisions

- Vite + React + TypeScript.
- Plain CSS with small, documented design tokens.
- Pure validation module independent of React (`src/lib/cin.ts`).
- Vitest for unit tests; React Testing Library for interaction tests.
- No backend, database, auth, analytics, or third-party identifier submission.

## 12. Quality targets

- Sourced CIN and LLPIN fixtures in `src/data/realFixtures.ts` with source URLs.
- Unit and UI tests for the assignment edge cases.
- 500-line paste should remain responsive.
- 5,000 non-empty line safety cap with an explicit message.
- Keyboard-accessible controls, semantic labels, visible focus, useful screen-reader announcements, and at least 44px touch targets.
- Mobile review at 360px and desktop review at common laptop widths.

## 13. Research and QA documents

- [CIN / LLPIN research and source register](./docs/RESEARCH.md)
- [Test plan](./docs/TEST-PLAN.md)
- [Sourced fixtures](./src/data/realFixtures.ts)
- [State and ownership mappings](./src/data/researchMappings.ts)
