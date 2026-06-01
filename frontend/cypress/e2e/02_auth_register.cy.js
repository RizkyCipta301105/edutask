// ─── Smoke Test: Authentication – Register ───────────────────────────────────
// Covers: page render for each role, form field presence, validation rules,
//         terms checkbox enforcement, and navigation back to login.

describe('Register Page – Mahasiswa', () => {
  beforeEach(() => {
    cy.logout()
    cy.visit('/register/mahasiswa')
  })

  it('renders mahasiswa registration form', () => {
    cy.contains('Registrasi Mahasiswa').should('be.visible')
    cy.get('input[name="nama_lengkap"]').should('be.visible')
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.contains('Daftar Akun Mahasiswa').should('be.visible')
  })

  it('blocks submission without accepting terms', () => {
    cy.get('input[name="nama_lengkap"]').type('Test Mahasiswa')
    cy.get('input[name="email"]').type('test@student.pens.ac.id')
    cy.get('input[name="password"]').type('password123')
    cy.contains('Daftar Akun Mahasiswa').click()
    cy.contains(/syarat dan ketentuan/i).should('be.visible')
  })

  it('blocks non-PENS email for mahasiswa', () => {
    cy.get('input[name="nama_lengkap"]').type('Test Mahasiswa')
    cy.get('input[name="email"]').type('test@gmail.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[type="checkbox"]').check()
    cy.contains('Daftar Akun Mahasiswa').click()
    cy.contains(/domain kampus PENS/i).should('be.visible')
  })

  it('has a link back to login', () => {
    cy.contains('Masuk di sini').should('have.attr', 'href', '/login')
  })
})

describe('Register Page – Umum', () => {
  beforeEach(() => {
    cy.logout()
    cy.visit('/register/umum')
  })

  it('renders umum registration form in English', () => {
    cy.contains('Create an Account').should('be.visible')
    cy.contains('Full Name').should('be.visible')
    cy.contains('Email Address').should('be.visible')
    cy.contains('Register Account').should('be.visible')
  })

  it('blocks submission without accepting terms', () => {
    cy.get('input[name="nama_lengkap"]').type('Test User')
    cy.get('input[name="email"]').type('test@gmail.com')
    cy.get('input[name="password"]').type('password123')
    cy.contains('Register Account').click()
    cy.contains(/terms and conditions/i).should('be.visible')
  })

  it('accepts any email domain for umum role', () => {
    // Umum should not block non-PENS emails — just check no domain error appears
    cy.get('input[name="nama_lengkap"]').type('Test User')
    cy.get('input[name="email"]').type('test@gmail.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('input[type="checkbox"]').check()
    cy.contains('Register Account').click()
    cy.contains(/domain kampus PENS/i).should('not.exist')
  })
})

describe('Register Page – Dosen', () => {
  beforeEach(() => {
    cy.logout()
    cy.visit('/register/dosen')
  })

  it('renders dosen registration form', () => {
    cy.contains('Registrasi Dosen').should('be.visible')
    cy.contains('Email Dosen').should('be.visible')
    cy.contains('Daftar Akun Dosen').should('be.visible')
  })
})
