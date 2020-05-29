Feature: Scheduler

  All features related to the scheduler

  Scenario: Specialist Save All Day Event
    Given I am already logged in as Specialist

    When I click cell under Wed
    And I type "Testing All Day" in an input with placeholder "Title"
    And I click button with text "Save"

    Then I should not see "Details"
    
    When I click container with text "Testing All Day"
    And I click element with title "Delete"
    And I click button with text "Delete"

    Then I should not see "Testing All Day"
