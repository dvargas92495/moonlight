Feature: Dentist Page
 
  All features available on the dentist page
  
  @master
  Scenario: Successfully Logging In
    Given I open dentists page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Applepie5!" into second input

    When I click button with text "LOG IN"

    Then I should see "What Service would you like to offer your patients"

  Scenario: Failed Log In
    Given I open dentists page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Bad Password" into second input

    When I click button with text "LOG IN"

    Then I should see "Incorrect username or password."