// ─── Smoke Test: Navigation & Routing ───────────────────────────────────────
// Covers: landing page, 404 redirect, guest-only route redirect,
//         and sidebar/nav links when authenticated.

describe('Public Routes', () => {
  it('landing page loads at /', () => {
    cy.visit('/')
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    // Should not redirect to login
    cy.url().should('not.include', '/login')
  })

  it('unknown route redirects to landing page', () => {
    cy.visit('/this-route-does-not-exist')
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })

  it('forgot-password page is accessible as guest', () => {
    cy.logout()
    cy.visit('/forgot-password')
    cy.url().should('include', '/forgot-password')
    cy.get('input[name="email"], input[type="email"]').should('be.visible')
  })
})

describe('Guest Route Redirect (already logged in)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
  })

  it('redirects /login to dashboard when already authenticated', () => {
    cy.visit('/login')
    cy.url({ timeout: 8000 }).should('include', '/dashboard')
  })

  it('redirects /register to dashboard when already authenticated', () => {
    cy.visit('/register/mahasiswa')
    cy.url({ timeout: 8000 }).should('include', '/dashboard')
  })
})

describe('Authenticated Navigation (requires running backend)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/dashboard/mahasiswa')
  })

  it('can navigate to /tasks via sidebar/nav', () => {
    // Sidebar label is "Tugas Akademik" for mahasiswa or "Tugas & Proyek" for umum
    cy.get('.nav-item').contains(/tugas/i, { timeout: 8000 }).click()
    cy.url({ timeout: 8000 }).should('include', '/tasks')
  })

  it('can navigate to /schedule via sidebar/nav', () => {
    cy.get('.nav-item').contains(/jadwal/i, { timeout: 8000 }).click()
    cy.url({ timeout: 8000 }).should('include', '/schedule')
  })

  it('can navigate to /profile via sidebar/nav', () => {
    // Sidebar label is "Pengaturan" (not profil/profile)
    cy.get('.nav-item').contains(/pengaturan/i, { timeout: 8000 }).click()
    cy.url({ timeout: 8000 }).should('include', '/profile')
  })
})
