import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Node environment on purpose: everything under test here is pure logic.
    // The rendering layer is covered by `next build`, not by a DOM shim.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
