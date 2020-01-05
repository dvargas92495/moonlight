Feature: Login Page
 
  All features available on the log in page
  
  @master
  Scenario: Successfully Logging In
    Given I open login page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Applepie5!" into second input

    When I click button with text "LOG IN"

    Then I should see "MOONLIGHT HEALTH"

  Scenario: Failed Log In
    Given I open login page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Bad Password" into second input

    When I click button with text "LOG IN"

    Then I should see "Incorrect username or password."