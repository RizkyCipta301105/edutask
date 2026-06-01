import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    // Suppress uncaught exceptions from the app (e.g. hot-reload noise)
    experimentalRunAllSpecs: true,
  },
  env: {
    // Override via cypress.env.json or --env flag — never hardcode real creds here
    TEST_USER_EMAIL: 'testuser@student.pens.ac.id',
    TEST_USER_PASSWORD: 'testpassword123',
    TEST_DOSEN_EMAIL: 'testdosen@pens.ac.id',
    TEST_DOSEN_PASSWORD: 'testpassword123',
    TEST_UMUM_EMAIL: 'testumum@gmail.com',
    TEST_UMUM_PASSWORD: 'testpassword123',
    API_URL: 'http://localhost:8000',
  },
})
