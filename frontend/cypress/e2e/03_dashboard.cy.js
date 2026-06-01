// ─── Smoke Test: Dashboard ───────────────────────────────────────────────────
// Covers: protected route redirect, dashboard tabs render, role-based content.
// Uses API login to skip UI login overhead.

describe('Dashboard – Unauthenticated', () => {
  it('redirects to login when not authenticated', () => {
    cy.logout()
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('redirects /dashboard/mahasiswa to login when not authenticated', () => {
    cy.logout()
    cy.visit('/dashboard/mahasiswa')
    cy.url().should('include', '/login')
  })
})

describe('Dashboard – Authenticated (requires running backend)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/dashboard/mahasiswa')
  })

  it('loads the dashboard without crashing', () => {
    cy.url({ timeout: 10000 }).should('include', '/dashboard')
    // AppLayout should render — look for nav or sidebar
    cy.get('nav, aside, [role="navigation"]', { timeout: 8000 }).should('exist')
  })

  it('shows the Overview tab by default', () => {
    cy.contains(/overview|beranda/i, { timeout: 8000 }).should('be.visible')
  })

  it('can navigate to Ruang Edukasi tab', () => {
    cy.contains(/ruang edukasi/i).click()
    cy.contains(/ruang edukasi/i).should('be.visible')
  })

  it('can navigate to Inbox tab', () => {
    cy.contains(/inbox/i).click()
    cy.contains(/inbox|pesan/i).should('be.visible')
  })

  it('can navigate to Report tab', () => {
    cy.contains(/report|laporan/i).click()
    cy.contains(/report|laporan|analitik/i).should('be.visible')
  })
})
