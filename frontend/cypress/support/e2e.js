// ─── Global support file ────────────────────────────────────────────────────
// Loaded automatically before every spec file.

// Suppress uncaught exceptions that originate from the app (not the test).
// This prevents flaky failures caused by React hot-reload or third-party errors.
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  if (
    err.message.includes('ResizeObserver loop') ||
    err.message.includes('Non-Error promise rejection') ||
    err.message.includes('ChunkLoadError')
  ) {
    return false
  }
})

// Import custom commands
import './commands'
