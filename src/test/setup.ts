import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Vitest globals are disabled in this project, so Testing Library cannot
// discover a global afterEach hook for its automatic cleanup. Register it
// explicitly to prevent rendered components leaking between tests.
afterEach(() => {
  cleanup();
});
