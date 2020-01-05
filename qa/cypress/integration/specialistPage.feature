Feature: Specialist Page
 
  All features available on the specialist page
  
  Scenario: Open Dashboard
    Given I am already logged in
    
    When I click link with text "SPECIALISTS"

    Then I should see "Your Specialist Dashboard"
