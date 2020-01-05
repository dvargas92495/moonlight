Feature: Dentist Page
 
  All features available on the dentist page
  
  Scenario: Open Dashboard
    Given I am already logged in
    
    When I click link with text "DENTISTS"

    Then I should see "Your Dentist Dashboard"
