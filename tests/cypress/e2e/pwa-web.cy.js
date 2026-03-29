describe('EVAQ Web PWA', () => {
  it('Should load the PWA and contain bottom navigation', () => {
    // Visite de la PWA Next.js
    cy.visit('https://evaq-web.vercel.app')
    
    // Vérifier que la navigation bottom bar est présente (ISO Parity)
    cy.contains('Accueil', { timeout: 10000 }).should('be.visible')
    cy.contains('Kit', { timeout: 5000 }).should('be.visible')
    cy.contains('Premium', { timeout: 5000 }).should('be.visible')
  })
})
