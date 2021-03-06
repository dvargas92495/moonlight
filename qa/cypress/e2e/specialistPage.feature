Feature: Specialist Page
 
  All features available on the specialist page
  
  Scenario: Save Availability
    Given I am already logged in as Specialist
    And I click SETTINGS
    
    When I type "08:00" into "Start of Working Hours" input
    And I type "16:00" into "End of Working Hours" input
    And I uncheck "Sun" input
    And I uncheck "Mon" input
    And I check "Tue" input
    And I check "Wed" input
    And I check "Thu" input
    And I uncheck "Fri" input
    And I uncheck "Sat" input
    And I click button with text "SAVE"
    And I click SCHEDULE

   # Then I should be available from '8:00 AM' to '4:00 PM' on '2,3,4'
