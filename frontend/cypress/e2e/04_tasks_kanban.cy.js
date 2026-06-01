// ─── Smoke Test: Task Management & Kanban Board ──────────────────────────────
// Covers: page load, tab switching, add-task modal open/close,
//         kanban board render, and basic task creation flow.

describe('Task Management – Unauthenticated', () => {
  it('redirects to login when not authenticated', () => {
    cy.logout()
    cy.visit('/tasks')
    cy.url().should('include', '/login')
  })
})

describe('Task Management – Authenticated (requires running backend)', () => {
  beforeEach(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/tasks')
  })

  it('loads the task management page', () => {
    cy.url({ timeout: 10000 }).should('include', '/tasks')
  })

  it('shows Kanban Board tab and Backlog tab', () => {
    cy.contains(/kanban board/i, { timeout: 8000 }).should('be.visible')
    cy.contains(/backlog/i).should('be.visible')
  })

  it('renders the Board tab content (columns or empty state)', () => {
    // Board tab is active by default — click it to be sure
    cy.contains(/kanban board/i).click()
    // Board renders either:
    //   a) kanban columns (To Do / In Progress / Done) when tasks exist
    //   b) empty state with "Buat Task Pertama" button when no tasks
    cy.get('body', { timeout: 8000 }).then($body => {
      const text = $body.text()
      if (text.includes('To Do') || text.includes('In Progress')) {
        // Has tasks — columns visible
        cy.contains(/to do/i).should('exist')
      } else {
        // Empty state
        cy.contains(/buat task pertama|belum ada task|tambah task/i).should('exist')
      }
    })
  })

  it('opens the Add Task modal via Tambah Task button', () => {
    // "Tambah Task" button is in the page header
    cy.contains('button', 'Tambah Task').click()
    cy.contains('Task Baru', { timeout: 6000 }).should('be.visible')
  })

  it('closes the Add Task modal with the Batal button', () => {
    cy.contains('button', 'Tambah Task').click()
    cy.contains('Task Baru', { timeout: 6000 }).should('be.visible')
    cy.contains('button', 'Batal').click()
    cy.contains('Task Baru').should('not.exist')
  })

  it('can switch to Backlog tab', () => {
    cy.contains(/backlog/i).click()
    cy.contains(/backlog/i).should('be.visible')
  })
})

describe('Task Creation Flow (requires running backend)', () => {
  const taskTitle = `Cypress Smoke Task ${Date.now()}`

  before(() => {
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/tasks')
  })

  it('creates a task via API and verifies it appears in the app', () => {
    // Get token from localStorage then create task via API
    cy.getAccessToken().then(token => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/api/tasks/`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          judul: taskTitle,
          deskripsi: 'Created by Cypress smoke test',
          status: 'todo',
          prioritas: 'sedang',
          deadline: '2026-12-31',
        },
      }).then(response => {
        expect(response.status).to.eq(201)
      })
    })

    // Reload page and verify task appears
    cy.reload()
    cy.get('body', { timeout: 10000 }).then($body => {
      if ($body.text().includes(taskTitle)) {
        cy.contains(taskTitle).should('exist')
      } else {
        cy.contains(/backlog/i).click()
        cy.contains(taskTitle, { timeout: 8000 }).should('exist')
      }
    })
  })

  it('opens Add Task modal and fills the form', () => {
    // Re-login in case session was lost after reload in previous test
    cy.loginViaApi(
      Cypress.env('TEST_USER_EMAIL'),
      Cypress.env('TEST_USER_PASSWORD')
    )
    cy.visit('/tasks')
    cy.url({ timeout: 8000 }).should('include', '/tasks')

    // Verify the modal form works correctly (UI smoke — not full submission)
    cy.contains('button', 'Tambah Task', { timeout: 8000 }).click()
    cy.contains('Task Baru', { timeout: 6000 }).should('be.visible')

    const uiTitle = `Cypress UI Task ${Date.now()}`
    cy.get('.add-task-title-input').clear().type(uiTitle)
    cy.get('.add-task-title-input').should('have.value', uiTitle)

    // Verify priority and status dropdowns are present
    cy.contains(/sedang|tinggi|rendah/i).should('exist')
    cy.contains(/to do|in progress|done/i).should('exist')

    // Close modal
    cy.contains('button', 'Batal').click()
    cy.contains('Task Baru').should('not.exist')
  })
})
