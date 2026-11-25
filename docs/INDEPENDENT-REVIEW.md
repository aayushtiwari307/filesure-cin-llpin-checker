# Independent code review — 25 November 2026

A separate AI-assisted review was performed against a source snapshot of this repository. The reviewer independently reproduced the existing test, typecheck, production build, and dependency-audit results before reporting additional edge cases. The reviewer did not modify the source; the corrections below were implemented after evaluating the findings.

## Findings addressed

- Added the `UR` Uttarakhand CIN mapping, a government-sourced fixture, and regression assertions that every sourced CIN resolves to a state name.
- Increased small UI text sizes and darkened the help / placeholder colours to improve legibility and normal-text contrast.
- Updated the NPL explanation to reflect both the MoSPI Section 25 terminology and the published 2024 Section 8 incorporation disclosure for Angel One Foundation, without claiming that a CIN establishes an individual entity's current legal status.
- Preserved leading zeroes in numeric-looking industry and ROC registration columns in Excel-oriented CSV output while retaining formula-injection protection for user-controlled text.
- Added an explicit message when multiple identifier candidates appear on one line.
- Improved tab-delimited spreadsheet paste handling: recognisable header rows are skipped, identifier-like cells are retained, adjacent company-name / description cells are skipped, and the UI reports how many non-identifier cells were skipped.
- Added a separate duplicate count while keeping duplicates in the review bucket, with singular / plural labels.
- Added a temporary, screen-reader-announced copy status and memoised result cards to avoid unnecessary re-renders.
- Moved UI revision notes into `docs/` and cleaned submission-oriented README / security documentation.

## Review scope and limits

The independent reviewer used jsdom for logic probes and inspected CSS / source, but did not perform a real browser, physical-device, or screen-reader audit. The project owner separately inspected the browser UI during manual QA. These checks do not constitute formal accessibility certification or live MCA verification.
