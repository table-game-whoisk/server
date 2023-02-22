// https://github.com/Alex-Programer/development-manual/blob/master/web/%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B5%8B%E8%AF%95/Cypress.md
describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
    cy.fixture('example').then(res => {
      cy.log(res.name)
    })
  })
})
