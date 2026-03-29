describe('EVAQ Mobile Preview (Flutter Web)', () => {
  it('Should load the mobile app interface and canvas', () => {
    // Visite de la version de prévisualisation Flutter Web
    cy.visit('/')
    
    // Vérifier que le canvas (Flutter rendering engine) est bien chargé
    cy.get('flutter-view', { timeout: 30000 }).should('exist')
    
    // Le DOM Flutter Web est dessiné en ombres (shadow DOM) ou tags spécifiques, on s'assure qu'aucun crash n'est visible
    cy.get('body').should('not.contain.text', 'Error')
  })
})
