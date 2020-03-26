Feature: Specialist Page
 
  All features available on the specialist page
  
  Scenario: Save Availability
    Given I am already logged in
    And I click link with text "SPECIALISTS"
    And I click SETTINGS
    
    When I type "11:00" into "Start of Working Hours" input
    And I type "14:00" into "End of Working Hours" input
    And I uncheck "Sun" input
    And I uncheck "Mon" input
    And I uncheck "Tue" input
    And I check "Wed" input
    And I uncheck "Thu" input
    And I uncheck "Fri" input
    And I uncheck "Sat" input
    And I click button with text "SAVE"
    And I click SCHEDULE

    # Work on verify
