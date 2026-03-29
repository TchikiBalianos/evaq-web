describe('PWA E2E: Navigation et Parcours Utilisateurs', () => {
  beforeEach(() => {
    // S'assurer qu'on utilise un grand écran mobile standard
    cy.viewport(390, 844)
    cy.visit('https://evaq-web.vercel.app')
  })

  it('Vérifie le fonctionnement de la barre de navigation (Bottom Bar)', () => {
    // 1. Alertes
    cy.contains('nav a', 'Alertes').click()
    cy.url().should('include', '/alertes')
    cy.get('h1').should('exist')

    // 2. Évacuation
    cy.contains('nav a', 'Évacuation').click()
    cy.url().should('include', '/plan-fuite')
    
    // Le composant dynamique évacuation charge la map
    cy.contains('Chargement de la carte', { timeout: 15000 }).should('not.exist')

    // 3. Kit
    cy.contains('nav a', 'Kit').click()
    cy.url().should('include', '/kit')
    cy.contains('Score de Préparation').should('exist')
  })

  it('Test du parcours Kit (Gamification UI)', () => {
    cy.visit('https://evaq-web.vercel.app/kit')
    
    // Vérifier l'UI de base
    cy.contains('Score de Préparation').should('be.visible')
    
    // Switch de catégories (tests UI des filtres)
    const categories = ['Nourriture', 'Médical', 'Outils', 'Documents']
    categories.forEach(cat => {
      cy.contains('button', cat).click()
      // Le délai permet à l'animation de se terminer
      cy.wait(200) 
    })
    
    // Vérifier que le bouton flottant "Ajout" est là (état vide)
    cy.get('button[title*="Add item"], button[title*="Ajouter"]').should('exist')
  })

  it('Test du parcours Premium & Mock Solana', () => {
    cy.visit('https://evaq-web.vercel.app/premium')
    
    // Vérifier la présence du mock de paiement Solana ISO
    cy.contains('Solana', { matchCase: false }).should('be.visible')
    
    // S'assurer que les boutons de paiement affichent soit le prix, soit "Souscrire"
    cy.get('button').contains(/€|Souscrire|Payer/).should('exist')
    
    // Stub de la window.alert appelée par notre mock Solana
    const stub = cy.stub()
    cy.on('window:alert', stub)
    
    // Clique sur le bouton Phantom / Solflare Mock
    cy.contains('Phantom / Solflare').click().then(() => {
      expect(stub.getCall(0)).to.be.calledWithMatch(/Connexion Wallet Solana Mockée/)
    })
  })
})
