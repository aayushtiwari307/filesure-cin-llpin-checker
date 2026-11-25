# FileSure — CIN & LLPIN Checker

A browser-based tool for validating and understanding Indian Corporate Identification Numbers (CINs) and Limited Liability Partnership Identification Numbers (LLPINs).

**Live Application:** https://filesure-cin-llpin-checker.vercel.app  
**GitHub Repository:** https://github.com/aayushtiwari307/filesure-cin-llpin-checker

---

## Overview

FileSure CIN & LLPIN Checker helps users inspect company and LLP identification numbers in a simple and understandable way.

Instead of checking identifiers individually, users can paste multiple entries and receive structured results with validation feedback, extracted information, and explanations for entries that need attention.

The application is designed as a lightweight, responsive, client-side web application. It does not require user registration or a backend server.

## Features

- **CIN validation:** Checks the structural format of Corporate Identification Numbers.
- **LLPIN validation:** Recognises and checks the structural format of LLP Identification Numbers.
- **Bulk input:** Processes multiple identifiers in one submission.
- **Detailed results:** Displays identifier type, validation status, and available parsed information.
- **Information extraction:** Extracts fields such as incorporation year, state code, listing status, and company type where applicable.
- **Clear feedback:** Explains validation issues instead of returning only a pass/fail result.
- **Result filtering:** Filter entries by All, Valid, Invalid, and Review-needed categories.
- **Duplicate detection:** Identifies repeated identifiers and flags potential duplicates for review.
- **Copy results:** Copy processed results for convenient sharing.
- **CSV export:** Export results for further analysis in spreadsheet applications.
- **Responsive interface:** Designed to work across desktop and smaller screen sizes.
- **Client-side processing:** Identifier processing takes place in the browser.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe application logic |
| Vite | Development server and build tooling |
| CSS | Responsive styling and interface design |
| Vitest | Automated testing |
| React Testing Library | UI component testing |

## How It Works

1. The user enters one or more CIN or LLPIN values.
2. The application normalises the input where appropriate.
3. Each entry is checked against the applicable identifier structure and validation rules.
4. The application extracts information from recognised character positions.
5. Results are categorised as valid, invalid, or requiring review.
6. The user can filter, copy, or export the results.

## Important Validation Limitation

**This application performs structural validation; it does not perform live MCA registry verification.**

A structurally valid CIN or LLPIN does not necessarily mean that the company or LLP exists, is currently active, or has a particular legal status.

The application does not connect to the Ministry of Corporate Affairs (MCA) database or verify live company records. Registry existence and current status must be confirmed through appropriate official MCA services.

The results should therefore be understood as format-validation and parsing results, not as legal or registry certification.

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm (npm 11 or later recommended)

### Installation

Clone the repository:

```bash
git clone https://github.com/aayushtiwari307/filesure-cin-llpin-checker.git
```

Navigate into the project directory:

```bash
cd filesure-cin-llpin-checker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

No environment variables, database, or backend configuration are required.

## Quality Checks

Run the automated test suite:

```bash
npm test
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

The production output is generated in the `dist/` directory.

## Deployment

The application is deployed on **Vercel**.

Deployment configuration:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | Not required |

The project can also be hosted on another static hosting platform that supports Vite applications.

## Project Structure

```text
filesure-cin-llpin-checker/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── lib/
│   │   └── cin.ts
│   ├── test/
│   │   └── setup.ts
│   ├── main.tsx
│   └── styles.css
│
├── docs/
│   ├── INDEPENDENT-REVIEW.md
│   ├── RESEARCH.md
│   ├── SECURITY-UPDATE.md
│   └── UI-REFRESH-NOTES.md
│
├── tests/
│
├── index.html
├── package.json
├── package-lock.json
├── SPEC.md
├── tsconfig.json
└── vite.config.ts
```

## Privacy and Security

- Identifier processing happens locally in the browser.
- The application does not require account creation or login.
- No backend database is used.
- No environment secrets or API credentials are required.
- Users should still avoid entering confidential information into public or shared devices.

## AI-Assisted Development

AI tools were used as development assistants during the implementation process. Their output was reviewed, tested, and corrected where necessary.

An independent review helped identify issues such as a missing state-code mapping. The mapping was corrected and regression coverage was added.

AI-generated suggestions were not treated as automatically correct. The implementation was verified through code review, manual checks, and automated tests.

## Future Improvements

Potential enhancements include:

- Integration with an authorised MCA data source for registry-level verification.
- More detailed validation explanations.
- Additional import and export options.
- Expanded automated test coverage for edge cases.

---

**Built by Aayush Tiwari**  
GitHub: https://github.com/aayushtiwari307
