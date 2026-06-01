// ─── Smoke Test: Profile Page ────────────────────────────────────────────────
// Covers: protected route, profile data render, form fields.

describe('Profile Page – Unauthenticated', () => {
  it('redirects to login when not authenticated', () => {
    cy.logout()
    cy.visit('/profile')
    cy.url().should('include', '/login')
  })
})

describe('Profile Page – Authenticated (requires running backend)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/profile')
  })

  it('loads the profile page', () => {
    cy.url({ timeout: 10000 }).should('include', '/profile')
  })

  it('displays the user email', () => {
    cy.contains(Cypress.env('TEST_USER_EMAIL'), { timeout: 8000 }).should('be.visible')
  })

  it('shows editable password field', () => {
    // ProfilePage uses SettingsView — scroll into the settings area
    // The "Ubah Password" section exists in the page (may be clipped by overflow)
    cy.contains('Ubah Password').should('exist')
    // Password inputs exist in the DOM
    cy.get('input[placeholder*="password"], input[placeholder*="Password"]')
      .should('exist')
  })
})
