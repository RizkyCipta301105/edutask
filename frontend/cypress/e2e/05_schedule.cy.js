// ─── Smoke Test: Schedule Page ───────────────────────────────────────────────
// Covers: protected route, calendar render, weekly timetable, role-aware UI.

describe('Schedule Page – Unauthenticated', () => {
  it('redirects to login when not authenticated', () => {
    cy.logout()
    cy.visit('/schedule')
    cy.url().should('include', '/login')
  })
})

describe('Schedule Page – Authenticated (requires running backend)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/schedule')
  })

  it('loads the schedule page', () => {
    cy.url({ timeout: 10000 }).should('include', '/schedule')
  })

  it('renders the calendar view', () => {
    // Calendar should show month/week navigation
    cy.contains(/januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember/i, { timeout: 8000 })
      .should('be.visible')
  })

  it('renders day-of-week headers', () => {
    cy.contains(/sen|min|mon|sun/i, { timeout: 8000 }).should('be.visible')
  })

  it('shows Tambah Agenda Pribadi button for non-dosen', () => {
    // Mahasiswa should see personal agenda button, not class schedule button
    cy.contains(/agenda pribadi/i, { timeout: 8000 }).should('be.visible')
  })

  it('can navigate to next month', () => {
    // CalendarView uses .nav-arrow-btn buttons with ChevronLeft/ChevronRight icons
    cy.get('.nav-arrow-btn', { timeout: 8000 }).last().click()
    // Month name should still be visible after navigation
    cy.contains(/januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember/i)
      .should('be.visible')
  })
})
