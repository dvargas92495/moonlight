Feature: Login Page
 
  All features available on the log in page
  
  Scenario: Successfully Logging In as Support
    Given I open login page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Applepie5!" into second input

    When I click button with text "LOG IN"

    Then I should see "Your Support Dashboard"

  Scenario: Successfully Logging In as Specialist
    Given I open login page
    And I type "testuser92495@gmail.com" into first input
    And I type "asdfASDF1234!@#$" into second input

    When I click button with text "LOG IN"

    Then I should see "Your Specialist Dashboard"
  
  Scenario: Successfully Logging In as Dentist
    Given I open login page
    And I type "moonlight.dentist92495@gmail.com" into first input
    And I type "asdfASDF1234!@#$" into second input

    When I click button with text "LOG IN"

    Then I should see "Your Dentist Dashboard"

  Scenario: Failed Log In
    Given I open login page
    And I type "dvargas92495@gmail.com" into first input
    And I type "Bad Password" into second input

    When I click button with text "LOG IN"

    Then I should see "Incorrect username or password."