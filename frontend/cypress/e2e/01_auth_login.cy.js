// ─── Smoke Test: Authentication – Login ──────────────────────────────────────
// Covers: page render, form validation, successful login, failed login,
//         navigation to register, and dosen-specific login route.

describe('Login Page', () => {
  beforeEach(() => {
    cy.logout()
    cy.visit('/login')
  })

  it('renders the login form correctly', () => {
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain.text', 'Masuk')
    cy.contains('Lupa Password?').should('be.visible')
  })

  it('shows register links for all three roles', () => {
    cy.contains('Mahasiswa').should('have.attr', 'href', '/register/mahasiswa')
    cy.contains('Umum').should('have.attr', 'href', '/register/umum')
    cy.contains('Dosen').should('have.attr', 'href', '/register/dosen')
  })

  it('shows dosen portal link', () => {
    cy.contains('Masuk sebagai dosen').should('have.attr', 'href', '/login/dosen')
  })

  it('shows error on wrong credentials', () => {
    cy.get('input[name="email"]').type('wrong@student.pens.ac.id')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    // Toast or inline error should appear
    cy.contains(/salah|gagal|invalid/i, { timeout: 8000 }).should('be.visible')
  })

  it('toggles password visibility', () => {
    cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    cy.get('button[aria-label*="password"]').click()
    cy.get('input[name="password"]').should('have.attr', 'type', 'text')
    cy.get('button[aria-label*="password"]').click()
    cy.get('input[name="password"]').should('have.attr', 'type', 'password')
  })

  it('navigates to forgot password page', () => {
    cy.contains('Lupa Password?').click()
    cy.url().should('include', '/forgot-password')
  })

  it('dosen login route shows Portal Dosen label', () => {
    cy.visit('/login/dosen')
    cy.contains('Portal Dosen').should('be.visible')
    // Should NOT show the "login sebagai dosen" link (already on dosen page)
    cy.contains('Masuk sebagai dosen').should('not.exist')
  })

  context('Successful login (requires running backend)', () => {
    it('logs in as mahasiswa and redirects to dashboard', () => {
      cy.get('input[name="email"]').type(Cypress.env('TEST_USER_EMAIL'))
      cy.get('input[name="password"]').type(Cypress.env('TEST_USER_PASSWORD'))
      cy.get('button[type="submit"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      cy.contains(/selamat datang/i, { timeout: 8000 }).should('be.visible')
    })
  })
})
