describe('PWA EVAQ : Parcours Utilisateur Avancé (ISO Mobile)', () => {
  const TEST_URL = 'https://evaq-web.vercel.app'
  const DEMO_USER = 'demo_user@evaq.app'
  const DEMO_PWD = 'demo_password_123'

  beforeEach(() => {
    cy.viewport('iphone-xr')
    
    // Mock Supabase Auth
    cy.intercept('POST', '**/auth/v1/token*', (req) => {
      if (req.body.email === DEMO_USER && req.body.password === DEMO_PWD) {
        req.reply({
          statusCode: 200,
          body: { access_token: 'fake_demo_token', user: { id: 'demo_user_id', email: DEMO_USER } }
        })
      } else {
        req.reply({ statusCode: 401, body: { error: 'Invalid credentials' } })
      }
    }).as('loginRequest')

    // Mock Inventory
    cy.intercept('GET', '**/rest/v1/inventory_items*', {
      statusCode: 200,
      body: [
        { id: '1', category: 'water', title: 'Pack d\'eau 6L', quantity: 1, unit: 'pack' },
        { id: '2', category: 'food', title: 'Barres de céréales', quantity: 10, unit: 'barres' }
      ]
    }).as('getInventory')

    cy.visit(`${TEST_URL}/login`)
  })

  it('Scénario 1 : Authentification Démo et Navigation Globale', () => {
    cy.get('input#email').type(DEMO_USER)
    cy.get('input#password').type(DEMO_PWD)
    cy.get('button[type="submit"]').click()
    
    cy.wait('@loginRequest')
    cy.url().should('include', '/dashboard')
    
    // Test direct des liens de la Bottom Nav
    const routes = ['/alertes', '/plan-fuite', '/kit', '/premium']
    routes.forEach(route => {
      cy.get(`nav a[href="${route}"]`).click()
      cy.url().should('include', route)
    })
  })

  it('Scénario 2 : Interaction RPG Kit (Calcul de Score)', () => {
    cy.visit(`${TEST_URL}/kit`)
    cy.wait('@getInventory')
    
    cy.contains('Score de Préparation').should('be.visible')
    
    // Ajout d'item
    cy.get('button').contains('+').click()
    cy.get('input').filter(':visible').first().type('Masque FFP3')
    
    cy.intercept('POST', '**/rest/v1/inventory_items*', {
      statusCode: 201,
      body: { id: '3', category: 'medical', title: 'Masque FFP3', quantity: 2, unit: 'unité' }
    }).as('addItem')

    cy.get('button').contains(/Ajouter|Save|Se connecter/).click() 
    cy.wait('@addItem')
    cy.contains('Masque FFP3').should('be.visible')
  })

  it('Scénario 3 : Premium & Mock Solana', () => {
    cy.visit(`${TEST_URL}/premium`)
    const alertStub = cy.stub()
    cy.on('window:alert', alertStub)
    cy.get('button').contains(/Phantom|Solflare/).click().then(() => {
      expect(alertStub.getCall(0)).to.be.calledWithMatch(/Connexion Wallet Solana Mockée/)
    })
  })
})
