describe('Flutter Web E2E: Smoketest & Navigation Spatiale Mobile', () => {
  const VIEWPORT_W = 390
  const VIEWPORT_H = 844

  beforeEach(() => {
    cy.viewport(VIEWPORT_W, VIEWPORT_H)
    cy.visit('https://evaq-app.vercel.app')
  })

  it('Scénario 1 : Initialisation et Rendu du Canvas Flutter', () => {
    cy.get('body', { timeout: 45000 }).should('not.contain.text', 'Application error')
    cy.get('flt-glass-pane', { timeout: 30000 }).should('exist')
    cy.wait(5000)
  })

  it('Scénario 2 : Parcours Navigation Bottom Bar (Spatiale)', () => {
    cy.wait(10000) // Attente stabilisée du moteur
    const navY = VIEWPORT_H - 45 
    
    const clickNavIndex = (index) => {
      const itemWidth = VIEWPORT_W / 5
      const x = (itemWidth * index) + (itemWidth / 2)
      cy.get('flt-glass-pane').click(x, navY, { force: true })
      cy.wait(3000) 
    }

    // Navigation séquentielle Dashboard -> Alertes -> Evac -> Kit -> Premium
    for (let i = 1; i <= 4; i++) {
      clickNavIndex(i)
      cy.get('body').should('not.contain.text', 'Exception')
    }
  })
})
