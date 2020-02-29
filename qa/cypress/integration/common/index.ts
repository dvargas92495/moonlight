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

const fillInput = (value: string, index: number) => {
  cy.get("input")
    .eq(index)
    .type(value);
};

const visitPage = (page: string) =>
  cy.visit(`/${page}`, { failOnStatusCode: false });

Given("I open {word} page", visitPage);

Given("I am already logged in", () => {
  visitPage("login");
  cy.fixture("testUser").then(({ username, password }) => {
    fillInput(username, 0);
    fillInput(password, 1);
  });
  cy.get("button").click();
});

Given("I type {string} into {word} input", (value, ordinal) => {
  fillInput(value, ordinalToIndex(ordinal));
});

When("I type {string} into {string} input", (value, label) => {
  cy.get(`input[placeholder="${label}"]`)
    .clear()
    .type(value);
});

When("I check {string} input", label => {
  cy.get(`span:contains("${label}")`)
    .parent()
    .find('input[type="checkbox"]')
    .check();
});

When("I uncheck {string} input", label => {
  cy.get(`span:contains("${label}")`)
    .parent()
    .find('input[type="checkbox"]')
    .uncheck();
});

When("I click button with text {string}", buttonText => {
  cy.get(`button:contains("${buttonText}")`).click();
});

When("I click link with text {string}", linkText => {
  cy.get(`a:contains("${linkText}")`).click();
});

When("I click {word}", text => {
  cy.get(`div:contains("${text}")`)
    .last()
    .click();
});

Then("I should see {string}", content => {
  cy.contains(content);
});
