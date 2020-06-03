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

Given("I am already logged in as Specialist", () => {
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

When("I check {string} input", (label) => cy.findByLabelText(label).check());

When("I uncheck {string} input", (label) =>
  cy.findByLabelText(label).uncheck()
);

When("I click button with text {string}", (buttonText) => {
  cy.get(`button:contains("${buttonText}")`).click();
});

When("I click link with text {string}", (linkText) => {
  cy.get(`a:contains("${linkText}")`).click();
});

When("I click container with text {string}", (content) => {
  cy.findByText(content).click();
});

When("I click element with title {string}", (content) => {
  cy.findByTitle(content).click();
});

When("I click {word}", (text) => {
  cy.get(`div:contains("${text}")`).last().click();
});

When("I click cell under {word}", (day) =>
  cy.findByText(day).then((d) => {
    const { top, left } = d[0].getBoundingClientRect();
    return cy.root().click(left + 20, top + 60);
  })
);

When("I click cell under {word} at {string}", (day) => cy.findByText(day));

When("I type {string} in an input with placeholder {string}", (value, label) =>
  cy.findByPlaceholderText(label).type(value)
);

Then("I should see {string}", (content) => {
  cy.findByText(content).should("be.visible");
});

Then("I should see svg in container with {string}", (content) =>
  cy.findByText(content).parent().find("svg").should("be.visible")
);

Then("I should not see {string}", (content) => {
  cy.findByText(content).should("not.be.visible");
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
