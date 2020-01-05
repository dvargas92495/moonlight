import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";

const ordinalToIndex = (ordinal: string) => {
  switch (ordinal) {
    case "first":
      return 0;
    case "second":
      return 1;
    default:
      return -1;
  }
};

Given("I open {word} page", page => {
  cy.visit(`/${page}`);
});

Given("I type {string} into {word} input", (value, ordinal) => {
  cy.get("input")
    .eq(ordinalToIndex(ordinal))
    .type(value);
});

When("I click button with text {string}", buttonText => {
  cy.get(`button:contains("${buttonText}")`).click();
});

Then("I should see {string}", content => {
  cy.contains(content);
});
