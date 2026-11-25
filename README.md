# FileSure CIN & LLPIN Checker

A browser-only checker that explains the structure of Indian Corporate Identity Numbers (CINs) and Limited Liability Partnership Identification Numbers (LLPINs). It is designed for professionals who need to review lists of identifiers and understand exactly which segments are recognised, malformed, duplicated, or uncertain.

> **Important:** This is a format checker, not an MCA lookup. A structurally valid result does not prove that an entity exists, is active, or is registered against that identifier.

## Features

- Check multiple CINs and LLPINs in one paste.
- Decode CIN listing marker, industry code, state / territory, incorporation year, company-type code, and registration number.
- Explain LLPIN structure without inventing fields that are not encoded in the identifier.
- Distinguish malformed identifiers from structurally formed identifiers with unmapped or uncertain metadata.
- Normalise supported paste artefacts and show when an identifier was changed during normalisation.
- Detect duplicates after safe canonicalisation, including case differences and the optional LLPIN display hyphen.
- Display CIN and LLPIN segments as chips, with malformed segments highlighted.
- Filter all, invalid, and review results; copy results or download CSV.
- Process up to 5,000 non-empty entries, with an explicit limit message and batched result rendering.
- Recognise Uttarakhand's `UR` CIN code alongside separately documented `UK` / `UT` aliases.
- Handle tab-delimited spreadsheet rows by skipping recognisable headers, retaining identifier-like cells, and noting ignored company-name / description cells.
- Give a specific explanation when more than one identifier is placed on a single line.
- Preserve leading zeroes in industry and ROC registration columns when the CSV is opened in spreadsheet software.
- Show a separate duplicate count while retaining duplicate entries in the review results.
- Keep all validation in the browser. Pasted identifiers are not submitted to a backend.

## Screenshots

The application uses a FileSure-inspired purple and lavender visual language, with responsive input and result panels. See the live preview after starting the development server.

## Technology

- React 19
- TypeScript 5.9
- Vite 7
- Vitest 4
- React Testing Library
- CSS (no component framework required)

There is no backend, database, login, or external validation API.

## Requirements

- Node.js `>=22.12.0`
- npm `>=10.9.9` (npm `11.21.3` is the recorded and recommended package-manager version)

npm `11.21.3` is the recorded and recommended package-manager version. An independent clean-install review also passed with npm `10.9.9`; npm `10.9.3` produced an Arborist `edgesOut` resolution error in the project owner's environment. If your npm 10 install hits that error, use the recorded npm version below.

## Run locally on Windows PowerShell

From the project root (the folder containing `package.json` and `package-lock.json`):

```powershell
npm ci
npm run dev
```

Open the local URL printed by Vite. The committed lockfile makes `npm ci` the reproducible install command. The lockfile in the release candidate was generated with npm `11.21.3`; a separate clean-install review also verified `npm ci` with npm `10.9.9`. If an older npm 10 release reports an Arborist `edgesOut` resolution error, use the recorded npm version for the install:

```powershell
npx --yes npm@11.21.3 ci
```

The project pins approval to the reviewed `esbuild@0.28.2` install script in `package.json`. If an existing local install still reports the approval as missing, approve only that exact installed version, then rebuild it:

```powershell
npx --yes npm@11.21.3 install-scripts approve esbuild
npx --yes npm@11.21.3 rebuild esbuild
```

## Quality checks

Run these from the project root:

```powershell
npm test
npm run typecheck
npm run build
npx --yes npm@11.21.3 audit
```

**Release verification:** run all four commands above after making changes and before deployment. The current dependency baseline is Vitest 4.1.12 with a Tinypool 2.1.2-or-newer override; see [SECURITY-UPDATE.md](./docs/SECURITY-UPDATE.md) for the recorded audit and install details.

## Deploy to Vercel

The project is a standard Vite single-page application:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: the repository root (the folder containing this `package.json`)
- Environment variables: none required

Deploy only after the repository contains the generated `package-lock.json` and the checks above pass in a clean install.

## Project structure

```text
src/
  App.tsx                    React interface and result interactions
  styles.css                 Responsive FileSure-inspired styling
  data/
    researchMappings.ts      State / territory and company-type mappings
    realFixtures.ts          Sourced parser fixtures
  lib/
    cin.ts                   Pure CIN / LLPIN parsing and validation logic
    __tests__/cin.test.ts    Validator tests
  App.test.tsx               UI tests
docs/
  RESEARCH.md                Sources, mapping confidence, and limitations
  TEST-PLAN.md               Manual and automated test coverage
  AI-VERIFICATION-LOG.md     Genuine implementation issues and corrections
  SECURITY-UPDATE.md         Patched test dependency information
  UI-REFRESH-NOTES.md        Visual-design changes
  INDEPENDENT-REVIEW.md      Independent review findings and corrections
SPEC.md                      Product specification
```

## Validation and research policy

- A malformed identifier is reported as invalid with an actionable explanation.
- A structurally correct identifier with an unmapped or medium-confidence metadata code is retained for review; the tool does not guess the code's meaning.
- Source notes that explain high-confidence historical codes are informational, not automatically uncertainty warnings.
- `FLC` is documented as disputed across the cited references.
- LLPINs do not encode listing status, state, incorporation year, or company type; those fields are displayed as **Not encoded in LLPIN**.
- Year plausibility checks are presented as checker rules, not as an official MCA date-of-incorporation verification.
- Duplicate entries are retained and linked to the first matching entry; they are not silently removed.

See [SPEC.md](./SPEC.md), [CIN / LLPIN research](./docs/RESEARCH.md), and [the test plan](./docs/TEST-PLAN.md) for the detailed decisions and limitations.

## Privacy

All identifier parsing and decoding runs in the browser. The application does not send the pasted list to a server or third-party validation API.

## AI usage and assignment submission

The [AI verification log](./docs/AI-VERIFICATION-LOG.md) records genuine mistakes found during implementation and how they were corrected. It is **not** a substitute for FileSure's separate requirement to submit complete, unedited AI conversation transcripts. Preserve and submit the original conversation exports / share links independently.
