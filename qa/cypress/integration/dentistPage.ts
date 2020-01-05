describe("Dentist Page", function() {
  it("Should Log in", function() {
    cy.visit("/dentists");
    cy.fixture("user").then(({ username, password }) => {
      cy.get("input")
        .eq(0)
        .type(username);
      cy.get("input")
        .eq(1)
        .type(password);
    });
    cy.get("button").click();
    cy.contains("What Service would you like to offer your patients");
  });
});
