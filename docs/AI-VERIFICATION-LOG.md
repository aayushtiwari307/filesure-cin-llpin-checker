# AI implementation verification log

This is a short, factual record of issues found while reviewing the generated implementation. It is not a replacement for the full, unedited AI conversation transcripts requested by FileSure.

## 24 November 2026

### 1. LLPIN prefixes beginning with L or U

- **Initial AI implementation:** classified any identifier starting with `L` or `U` as a CIN before checking the LLPIN shape.
- **Why it was wrong:** an LLPIN is a three-letter prefix plus four digits; the format definition does not exclude prefixes beginning with `L` or `U`.
- **How it was caught:** a boundary-case review considered `LAA-1234` and `UAA-1234` before relying on the first-letter rule.
- **Correction:** classify 7/8-character LLPIN-shaped values before applying the CIN `L` / `U` marker rule. Added unit tests for both prefixes.

### 2. LLPIN information displayed as a warning

- **Initial AI implementation:** placed “state, year, listing status and company type are not decoded from LLPIN” in the warnings collection. That made every correctly formatted LLPIN look like it needed review.
- **Why it was wrong:** those fields are not encoded by the format used in this checker; that is an informational limitation, not a defect in the identifier.
- **Correction:** added a separate `information` field and neutral UI treatment. A correctly formatted LLPIN now receives a valid status.

### 3. Fixture source text syntax issue

- **Initial AI implementation:** used an unescaped apostrophe inside a single-quoted TypeScript fixture note.
- **How it was caught:** a TypeScript compile attempt reported a parse error in `realFixtures.ts`.
- **Correction:** changed the note to a double-quoted string and reran the pure-module TypeScript compile.

These are genuine issues from this build, not staged examples. The complete chat transcript remains the primary record of the prompts, corrections, and decisions.

### 4. Normalisation was removing two trailing commas

- **Initial implementation:** it removed a comma before quote handling and then attempted a second comma removal after quote handling. An input ending in `,,` could therefore be silently converted into a valid identifier.
- **How it was caught:** an independent regression probe used a deliberately malformed double-comma value.
- **Correction:** normalisation now removes at most one trailing comma, while still handling both `"ID",` and `"ID,"` wrappers. A regression test ensures `ID,,` remains invalid.

### 5. Duplicate result heading disagreed with its status

- **Initial implementation:** a duplicate valid identifier was changed to `valid-with-warnings`, but its heading still said “Valid CIN format”.
- **How it was caught:** inspection compared the status pill, heading, and duplicate warning.
- **Correction:** duplicate valid rows now use a duplicate-specific heading and explanation. Regression tests cover CIN and LLPIN duplicates.

### 6. Malformed 20/22-character CIN-like values could be misclassified

- **Initial implementation:** classification depended partly on the first character, so a 20-character typo beginning with an invalid marker could receive a generic identifier-shape error instead of the expected CIN-length message.
- **How it was caught:** a boundary test changed the first character of a 20-character CIN candidate.
- **Correction:** 19–23-character values are classified as CIN candidates before the shorter LLPIN heuristics; regression tests cover 20- and 22-character lengths.

### 7. Mapping notes were not consistently surfaced

- **Initial implementation:** a company-type mapping note was only shown for explicitly conflicting codes, which hid the historical context attached to `NPL`.
- **How it was caught:** a mapping-by-mapping UI audit compared the mapping table with information shown by the validator.
- **Correction in the audited build:** `NPL` historical context is shown as additional information, not as an uncertainty warning, because the mapping itself is high-confidence. A regression test ensures the note remains visible without changing the result to “Needs review”.

### 8. UI pagination state could carry into a changed input

- **Initial implementation:** after a user expanded many result batches, replacing the input could preserve the larger render limit.
- **How it was caught:** review of state transitions between a 5,000-row result set and a newly pasted smaller list.
- **Correction:** every textarea edit resets the visible batch to the first 500 rows, keeping large-list rendering predictable.

### 9. Official master-data destination had changed

- **Initial implementation:** the footer pointed to an older `.php` path.
- **How it was caught:** rechecking the live MCA Corporate Data Management portal.
- **Correction:** updated the official-record link to the current Company Master Details page.

### 10. Vitest matcher setup used the wrong adapter entry point

- **Initial implementation:** the setup file imported the generic `@testing-library/jest-dom` entry point while the test runner is Vitest.
- **How it was caught:** a test-environment configuration review against the package's Vitest integration.
- **Correction:** the setup now imports `@testing-library/jest-dom/vitest`, matching the selected test runner.


### 11. Excel tab-separated cells were merged into one invalid row

- **Initial implementation:** batch parsing split only on newlines and removed tabs inside each line. Pasting multiple Excel cells separated by tabs could concatenate them into one malformed identifier.
- **How it was caught:** an audit compared the test case named “Excel paste with tabs” with an actual tab-delimited multi-cell string.
- **Correction:** batch parsing now treats tabs as logical entry separators, while the single-value validator still removes an embedded tab as a paste-formatting artefact. Blank tab cells are counted with other blank entries.

### 12. LLPIN errors highlighted both segments together

- **Initial implementation:** the LLPIN prefix and serial shared one segment key, so an invalid prefix or number marked both chips as erroneous.
- **How it was caught:** direct tests inspected each segment's state for an invalid prefix and an invalid serial.
- **Correction:** prefix and number now have separate segment keys and highlight independently. A misplaced hyphen gets a whole-input highlight rather than falsely highlighting a serial that may otherwise look valid.

### 13. LLPIN company-type field wording did not match the assignment

- **Initial implementation:** the UI and CSV said “Not applicable to LLPIN” for company type, while the requirement calls for “Not encoded in LLPIN” for fields that the LLPIN does not encode.
- **Correction:** the UI, copy output, and CSV now consistently use “Not encoded in LLPIN”.

### 14. Copy / CSV could use stale results during the debounce window

- **Initial implementation:** the result list showed an updating hint, but export actions remained enabled for the previous parse during the short debounce interval.
- **Correction:** Copy and CSV are disabled until the current input has been parsed.


### 15. Medium-confidence state aliases could appear fully confirmed

- **Initial implementation:** the mapping data included a confidence field, but `PY` and `LA` had medium confidence without a note, so they were presented without a review warning.
- **How it was caught:** an audit compared the `confidence` field against the validator's warning conditions.
- **Correction:** all medium-confidence state mappings now produce a visible caution, with a fallback explanation when a specific note is not supplied. Tests cover `PY` and `LA` alongside the other historical/administrative aliases.


### 16. Short truncated CIN fragments were classified as LLPINs

- **Initial implementation:** any 7- or 8-character string was classified as an LLPIN before checking whether it began with a clear CIN marker followed by a digit.
- **How it was caught:** a manual boundary probe used the first eight characters of the sample CIN, `L17110MH`.
- **Why it was wrong:** the result described the fragment as a malformed LLPIN instead of reporting that a CIN candidate was 8 characters rather than 21.
- **Correction:** short values with the five-digit CIN industry segment and one or two state-code letters are treated as truncated CIN candidates. Three-letter LLPIN prefixes such as `LAA-1234`, `UAA-1234`, and malformed `U1A-1234` remain LLPIN candidates. Regression tests cover both patterns.

### 17. Copy confirmation remained visible after changing result filters

- **Initial implementation:** selecting a new filter did not clear the previous “Copied” confirmation.
- **Correction:** changing All / Invalid / Review resets the copy feedback so it cannot imply that the newly selected result set has already been copied.

### 18. Updating state was not exposed on the results region

- **Initial implementation:** the updating message was visible, but the results region did not expose its busy state to assistive technology.
- **Correction:** the results panel now sets `aria-busy` while the debounced input is being parsed.


### 19. Disputed company-type warning did not name its code

- **Initial implementation:** the `FLC` warning explained the disagreement but did not repeat the code in the warning sentence itself.
- **How it was caught:** standalone runtime assertions checked whether the warning was independently understandable when copied or read apart from the segment chip.
- **Correction:** company-type mapping notes are now prefixed with their code (for example, `FLC:` and `NPL:`), and a regression test checks the disputed code label.


### 20. Non-BMP characters could be split in segment display

- **Initial implementation:** CIN error text indexed a JavaScript string by UTF-16 code unit after locating the offending character by Unicode code point; LLPIN segment slicing also used UTF-16 offsets.
- **How it was caught:** an emoji probe checked the actual character displayed in the error / segment rather than only checking that validation failed.
- **Correction:** segment extraction and error-character lookup now use code-point arrays. Added regressions for an emoji in the CIN industry segment and LLPIN prefix.

### 21. CSV export ignored the active filter

- **Initial implementation:** Copy used the filtered result set, but CSV always exported every parsed row—even when Invalid or Review was selected.
- **Correction:** CSV now exports the same filtered result set as Copy and is disabled when that filter has no results.

### 22. Segment chip label needed a semantic group role

- **Initial implementation:** the segment container had an `aria-label` on a generic element.
- **Correction:** the container now uses `role="group"`, making its accessible label meaningful to assistive technology.


### 23. TypeScript project references were missing composite mode

- **Initial implementation:** the root TypeScript configuration referenced the app and Vite-config projects, but the referenced configs did not set `composite: true`, which is required for TypeScript project-reference build mode.
- **How it was caught:** inspection of the exact `tsc -b` command used by both `npm run typecheck` and the production build.
- **Correction:** enabled composite mode in both referenced configs. Full project type-check still requires dependencies to be installed in the user's environment.

### 24. An unused testing dependency was present

- **Initial implementation:** `@testing-library/user-event` was declared but the UI tests use `fireEvent` and never import it.
- **Correction:** removed the unused dependency to keep the project dependency set lean.


### 25. Misplaced LLPIN hyphens could create a false duplicate match

- **Initial implementation:** duplicate canonicalisation removed the first hyphen regardless of its position. A malformed `AAA1-234` therefore produced the same canonical value as `AAA-1234`.
- **How it was caught:** a batch test placed the malformed value beside the correctly formatted LLPIN and inspected duplicate metadata.
- **Correction:** only a correctly positioned or omitted display hyphen is canonicalised. A misplaced hyphen remains part of the malformed value, and a regression test ensures it is not reported as a duplicate of a valid LLPIN.


### 26. Unicode regression assertion incorrectly treated UTF-16 surrogate storage as corruption

- **Audit-only issue:** a custom assertion rejected the high surrogate that is legitimately part of JavaScript's UTF-16 representation of an emoji.
- **Correction:** the regression now compares the complete visible segment (`😀AA`) and counts Unicode code points with `Array.from`, which tests the behaviour rather than the string's internal encoding.


### 27. Explanatory state-source notes were incorrectly treated as review warnings

- **Initial implementation:** every state mapping with a note was flagged as “Needs review”, including high-confidence CIN-specific evidence for `CT`, `OR`, and `TG`.
- **Why it was wrong:** those notes document the source evidence; they do not signal uncertainty. This caused known examples such as the Chhattisgarh and Telangana CINs to look questionable.
- **Correction:** review warnings now follow the mapping's confidence level. Medium-confidence aliases remain visibly reviewable; high-confidence codes remain valid even when their research record contains an explanatory note. `AP` is medium confidence because older records cannot be geographically split from the CIN alone.


### 28. High-confidence historical company-type notes were incorrectly treated as uncertainty

- **Initial implementation:** any company-type `note` generated a review warning, including the high-confidence historical context for `NPL`.
- **Why it was wrong:** a source note may explain historical terminology without indicating that the mapping is uncertain. Review status should follow the confidence field, just as it does for state mappings.
- **Correction:** only explicitly conflicting company-type mappings generate review warnings. A high-confidence note is shown as additional information and does not change the status. The UI now labels this as “Additional information” rather than incorrectly calling it an LLPIN note.

### 29. Truncated CINs with a mistyped activity-code character could be misclassified as LLPINs

- **Initial implementation:** short CIN prefix detection required five digits, so a fragment such as `L17O10M` could fall through to LLPIN classification.
- **Correction:** truncated CIN candidate detection now tolerates alphanumeric characters in the incomplete CIN fragment while giving an actual three-letter LLPIN prefix or display hyphen precedence. Regression cases cover both `O`/`0` confusion and another mistyped activity character.


### 30. React Testing Library cleanup was not registered with Vitest

- **Initial setup:** the setup file loaded the Vitest matcher adapter but relied on Testing Library's automatic cleanup hook.
- **Why it was wrong:** this project does not enable Vitest globals, so Testing Library cannot discover a global `afterEach` to register automatic cleanup. Test renders could remain mounted between cases and contaminate later queries.
- **Correction:** explicitly import `afterEach` from Vitest and call Testing Library `cleanup()` after each test. This keeps the test environment deterministic without enabling global test APIs.


### 31. CSV showed an unknown state as only “Not mapped”

- **Initial behaviour:** the UI identified an unknown state as `Unmapped (XX)`, but the CSV export reduced it to the less useful `Not mapped` label.
- **Correction:** CSV now preserves the actual unknown state code in the same `Unmapped (CODE)` form used by the UI.

### 32. Caller-supplied batch limits were not normalised to integers

- **Initial behaviour:** a fractional `maxEntries` option could process more than the requested cap because array length comparisons are integer-based.
- **Correction:** the parser now clamps a finite limit to a positive integer and falls back to its default for non-finite values. A unit regression covers a fractional limit.

### 33. “Line” labels were inaccurate for tab-separated spreadsheet entries

- **Initial behaviour:** entries split from a tab-delimited spreadsheet row were labelled as separate source lines, although they may have come from the same physical line.
- **Correction:** visible result labels, copy output, duplicate messages and the CSV column now use “Entry”, which accurately describes both newline-delimited and tab-delimited input.


### 34. A merged-territory CIN code was missing from the state mapping

- **Initial implementation:** the mapping accepted historical `DH` and `DD`, but did not recognise `DN`.
- **How it was caught:** a fresh source review found an NSE-hosted Sanathan Textiles Limited disclosure dated 9 February 2026 that explicitly publishes CIN `L17299DN2005PLC005690`; NeSL's 29 July 2025 communiqué independently identifies `DN` for the merged Union Territory.
- **Correction:** added `DN` as a high-confidence, directly observed CIN code, documented its source and kept older `DH` / `DD` values as separate medium-confidence mappings. Added the published CIN as a sourced fixture and regression coverage.

### 35. Multiple LLPIN hyphens could collide with a valid canonical value

- **Initial implementation:** canonicalisation removed the first hyphen even when an LLPIN contained two hyphens. A malformed value such as `AAA--1234` could therefore share the canonical key `AAA-1234` with a valid identifier.
- **How it was caught:** a duplicate-detection review expanded the earlier misplaced-hyphen test to cover repeated punctuation.
- **Correction:** a hyphen is removed for canonical comparison only when there is exactly one hyphen and it is in the required fourth position. A regression test ensures `AAA--1234` remains invalid and is not marked as a duplicate of `AAA-1234`.


### 36. Overlong identifiers hid their final character in the segment chips

- **Initial implementation:** CIN registration and LLPIN serial chips were sliced to the expected field width even when the supplied value contained extra characters. The length error was correct, but the visual breakdown could omit the extra character.
- **How it was caught:** a review of 22-character CIN and overlong LLPIN examples compared the complete input with the rendered segment values.
- **Correction:** the final CIN registration chip and LLPIN serial chip now retain the entire remaining tail. The identifier is still rejected for its incorrect length; the UI no longer hides the character that caused the overflow. Added regression tests.

### 37. Sample-list UI test used a non-unique text query

- **Initial test:** the sample list contains two structurally valid CINs, but the UI test used `findByText('Valid CIN format')`, which requires exactly one matching element.
- **How it was caught:** the user's Windows Vitest run reported one failure: “Found multiple elements with the text: Valid CIN format”; the rendered DOM showed the two expected result cards (`result-title-1` and `result-title-2`). The other 55 tests passed.
- **Root cause:** the assertion was too strict for the sample data. This was a test defect, not a validation or rendering defect.
- **Correction:** use `findAllByRole('heading', { name: 'Valid CIN format' })` and assert that exactly two valid CIN cards are present. This tests the intended sample behaviour and avoids a brittle single-element query.

### 38. Test-runner dependency audit identified vulnerable Vitest transitive packages

- **Initial dependency:** the earlier project used Vitest `3.2.7`; the user's first `npm audit` reported the `@vitest/mocker` path-traversal / arbitrary-file-read advisory and two critical Tinypool prototype-pollution advisories.
- **How it was caught:** the dependency audit was run before preparing the public repository.
- **Correction:** upgraded to Vitest `4.1.12` and pinned the Tinypool dependency line to `^2.1.2` with an npm override. This avoids accepting npm's suggested forced jump to Vitest 5. Application and validator logic were not changed by the security update.
- **Install issue:** npm 10.9.x failed with `Cannot read properties of null (reading 'edgesOut')` while resolving the updated graph. Using `npx --yes npm@11.21.3 install` succeeded. The user explicitly approved the `esbuild` install script and rebuilt esbuild.
- **Verification on 24 November 2026:** the Windows release-candidate run reported `found 0 vulnerabilities` from `npx --yes npm@11.21.3 audit`; Vitest 4.1.12 passed all 56 tests; `npm run typecheck` completed without errors; and `npm run build` completed successfully. The UI, validator, and tests remained operational after the dependency update.


### 39. Uttarakhand CIN state code `UR` was missing

- **Initial implementation:** the mapping included `UK` and `UT` but omitted `UR`.
- **How it was caught:** an independent code review tested `U40109UR2001SGC025867`; the MCA RoC Uttarakhand list and a government-hosted Uttarakhand Power Corporation filing publish `UR` in CINs.
- **Correction:** added `UR` as a high-confidence Uttarakhand CIN mapping, added the UPCL source fixture, and strengthened fixture tests to assert that every sourced CIN resolves a state name.

### 40. NPL was described only as a legacy Section 25 code

- **Initial implementation:** the high-confidence NPL label described it as a “Legacy Section 25 company code”.
- **How it was caught:** an independent review identified Angel One Limited’s 22 October 2024 exchange intimation, which describes Angel One Foundation as a Section 8 (not-for-profit) company and publishes CIN `U85500MH2024NPL433965`.
- **Correction:** changed the label to “Not-for-profit company (Section 8 / Section 25 context)”; the information note cites both the MoSPI terminology and the 2024 filing, and cautions that CIN alone does not establish an individual entity’s current statutory status.

### 41. Small helper and error text was difficult to read on mobile

- **Initial implementation:** several labels were 7–10px, and the input-help / placeholder colours had less than 4.5:1 contrast against their normal surfaces.
- **How it was caught:** the independent reviewer inspected CSS font sizes and calculated contrast ratios against the applicable backgrounds.
- **Correction:** increased message text and key supporting labels to 10–12px, removed the 7–9px mobile overrides for meaningful text, and darkened the input helper / placeholder greys. Decorative separators remain small.

### 42. Spreadsheet rows with company-name columns generated avoidable invalid results

- **Initial implementation:** all tab-separated cells were processed as independent entries, so a copied Company Name / CIN table also generated an invalid result for every company name.
- **How it was caught:** the independent review pasted typical two-column spreadsheet examples.
- **Correction:** batch parsing now filters tab-delimited rows to identifier-like cells when at least one candidate exists, counts skipped non-identifier cells, and tells the user how many were skipped. Rows with no candidate are retained as input so malformed values are still explained.

### 43. Multiple identifiers on a single line received an unhelpful length error

- **Initial implementation:** identifiers separated by a comma, semicolon, or spaces could be collapsed by normalisation into one long malformed entry.
- **Correction:** the validator now detects multiple CIN / LLPIN-like tokens on one line and asks the user to put each identifier on its own line. A regression test covers the explicit message.

### 44. Spreadsheet software could strip leading zeroes from CSV code columns

- **Initial implementation:** the raw CSV preserved digit strings such as `000123`, but Excel could interpret them as numbers and display `123`.
- **Correction:** only digit-only industry / registration code cells with leading zeroes are emitted as a spreadsheet text formula (`="000123"`). User-controlled cells continue to be protected against formula injection. A CSV regression test covers both fields.

### 45. Duplicate totals were only implicit in the review count

- **Initial behaviour:** duplicate entries correctly received review status, but the summary did not expose how many review rows were duplicates.
- **Correction:** added a separate duplicate count to the summary without changing the underlying valid / review / invalid classification.

### 46. Copy confirmation was not announced or cleared automatically

- **Initial behaviour:** the copy button label changed, but screen-reader users had no dedicated live announcement and the label could remain indefinitely.
- **Correction:** added a polite status live region and a 2.5-second reset for the copy confirmation.

### 47. Result segment labels relied on an unsemantic div label

- **Initial behaviour:** each chip used `aria-label` on a generic div without a programmatic group role.
- **Correction:** each segment chip now exposes a named group, preserving its segment label and meaning for assistive technology.

### 48. Documentation retained internal review / handoff wording at the project root

- **Initial behaviour:** UI notes and a Claude handoff note sat in the repository root; the security record referred to “the user's Windows environment”.
- **Correction:** moved UI notes into `docs/`, replaced the handoff note with an independent review record, and polished the README / security wording for an external reviewer.


### 49. Spreadsheet column headers could be misreported as invalid identifiers

- **Initial behaviour:** a pasted two-column table with a header such as `Company Name<TAB>CIN` was processed as input because neither header cell resembled a CIN / LLPIN.
- **Correction:** recognised CIN / LLPIN and company-name header labels are now skipped, including a standalone `CIN` header. Header cells are included in the ignored-cell count. Regression tests cover both a header row and the identifier rows beneath it.

### 50. npm compatibility guidance was too broad

- **Initial documentation:** it implied that npm 10.x generally failed with the Vitest 4 dependency graph.
- **Evidence:** the project owner's npm 10.9.3 `npm install` produced an Arborist `edgesOut` error; an independent review completed `npm ci` with npm 10.9.9.
- **Correction:** package metadata now declares npm `>=10.9.9`, recommends the recorded npm 11.21.3 version for reproducibility, and documents the two observed outcomes without generalising to all npm 10 releases.
