describe("Dentist Page", function() {
  it("Should Log in", function() {
    cy.visit("/dentists");
    cy.get("input")
      .eq(0)
      .type("dvargas92495@gmail.com");
    cy.get("input")
      .eq(1)
      .type("Applepie5!");
    cy.get("button").click();
    cy.contains("What Service would you like to offer your patients");
  });
});
