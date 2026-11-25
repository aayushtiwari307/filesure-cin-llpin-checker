# Dependency security update

The project uses Vitest `^4.1.12` and an npm override of Tinypool `^2.1.2` to avoid the vulnerable versions reported by the upstream advisories checked on 24 November 2026.

- Vitest 4.1.12 includes the Windows path-normalisation correction for the `@vitest/mocker` redirect-mock path-traversal issue, in addition to the earlier fix.
- Tinypool 2.1.2 includes the worker-option prototype-pollution corrections covered by GHSA-5gmw-xhrv-c9v3 and GHSA-85c8-ppgw-ccpr.
- The affected packages are test/development dependencies, not part of the browser runtime bundle. They still execute on developer machines and CI, so they must remain patched.

## npm compatibility

The package records npm 11.21.3 as its package manager and declares npm `>=10.9.9`. The independent review completed a clean `npm ci` with npm 10.9.9. In the project owner's environment, npm 10.9.3 `npm install` failed with an Arborist dependency-tree error (`Cannot read properties of null (reading 'edgesOut')`), while npm 11.21.3 installed successfully. For reproducibility, npm 11.21.3 is the recommended version; the evidence does not establish that every npm 10 release fails.

For a clean install on Windows PowerShell:

```powershell
npx --yes npm@11.21.3 ci
```

The project records a version-pinned approval for the reviewed `esbuild@0.28.2` install script in `package.json`. If an existing local copy still reports that approval as missing, review and approve only that exact installed version, then rebuild it:

```powershell
npx --yes npm@11.21.3 install-scripts approve esbuild
npx --yes npm@11.21.3 rebuild esbuild
```

When package metadata changes, update the existing lockfile with `npx --yes npm@11.21.3 install --package-lock-only`, then run `npm ci` to verify a clean reproducible installation. Commit the updated `package-lock.json`.

## Security-baseline verification recorded on 24 November 2026

Before the independent-review refinements described in `INDEPENDENT-REVIEW.md`, the Windows security-baseline verification completed the following checks after the dependency update:

- `npm test`: 2 test files passed, 56 tests passed.
- `npm run typecheck`: completed without errors.
- `npm run build`: completed; Vite transformed 31 modules and generated the production bundle.
- `npx --yes npm@11.21.3 audit`: `found 0 vulnerabilities`.

Do not use `npm audit fix --force` as a substitute for reviewing dependency changes. It may propose a major-version upgrade that is not required for the patched 4.x dependency line.
