import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { findIndex, split, map, includes } from "lodash";

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
  cy.get("input").eq(index).type(value);
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
  cy.get(`input[placeholder="${label}"]`).clear().type(value);
});

When("I check {string} input", (label) => {
  cy.get(`span:contains("${label}")`)
    .parent()
    .find('input[type="checkbox"]')
    .check();
});

When("I uncheck {string} input", (label) => {
  cy.get(`span:contains("${label}")`)
    .parent()
    .find('input[type="checkbox"]')
    .uncheck();
});

When("I click button with text {string}", (buttonText) => {
  cy.get(`button:contains("${buttonText}")`).click();
});

When("I click link with text {string}", (linkText) => {
  cy.get(`a:contains("${linkText}")`).click();
});

When("I click {word}", (text) => {
  cy.get(`div:contains("${text}")`).last().click();
});

Then("I should see {string}", (content) => {
  cy.contains(content);
});

Then(
  "I should be available from {string} to {string} on {string}",
  (startTime, endTime, days) => {
    const workDays = map(split(days, ","), (d) => parseInt(d));
    cy.get("tr").then((trs) => {
      const startIndex = findIndex(
        trs,
        (tr) => tr.innerText.indexOf(startTime) > -1
      );
      const endIndex = findIndex(
        trs,
        (tr) => tr.innerText.indexOf(endTime) > -1
      );
      cy.wrap(trs).each((tr, index) => {
        const tds = tr.children();
        const availableColor = tds.first().css("backgroundColor");
        cy.wrap(tds).each((td, j) => {
          if (
            j == 0 ||
            index == 0 ||
            (index >= startIndex &&
              index < endIndex &&
              includes(workDays, j - 1))
          ) {
            expect(td).to.have.css("backgroundColor", availableColor);
          } else {
            expect(td).to.not.have.css("backgroundColor", availableColor);
          }
        });
      });
    });
  }
);
