// ─── Custom Cypress Commands ─────────────────────────────────────────────────

/**
 * cy.loginViaApi(email, password)
 * Logs in by hitting the backend API directly (bypasses UI) and stores
 * the JWT tokens in localStorage so the app treats the session as authenticated.
 * Use this in tests that don't need to test the login UI itself.
 */
Cypress.Commands.add('loginViaApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/auth/login/`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(
        `loginViaApi failed (${response.status}): ${JSON.stringify(response.body)}`
      )
    }
    // EduTask wraps response: { success, message, data: { access, refresh, user } }
    const { access, refresh, user } = response.body.data
    window.localStorage.setItem('access_token', access)
    window.localStorage.setItem('refresh_token', refresh)
    window.localStorage.setItem('user', JSON.stringify(user))
  })
})

/**
 * cy.loginViaUI(email, password)
 * Logs in through the actual login form. Use when testing the auth UI.
 */
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

/**
 * cy.getAccessToken()
 * Returns the stored access token from localStorage via cy.window().
 */
Cypress.Commands.add('getAccessToken', () => {
  return cy.window().then(win => win.localStorage.getItem('access_token'))
})

/**
 * cy.logout()
 * Clears auth state from localStorage.
 */
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage()
})
