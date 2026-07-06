@editor @editor_tiny @tiny @tiny_multilang2 @javascript
Feature: Test the tiny editor multilang plugin with the fallback other feature enabled or disabled.

  Background: I login as admin and add a text to the description with two paragraphs.
    Given the following config values are set as admin:
      | requiremultilang2 | 0 | tiny_multilang2 |
      | highlight         | 1 | tiny_multilang2 |
      | showfallbackother | 1 | tiny_multilang2 |
    And the following "language packs" exist:
      | language |
      | de       |
    And the "multilang" filter is "on"
    And the "multilang" filter applies to "content"
    And the "multilang2" filter is "on"
    And the "multilang2" filter applies to "content"
    And the following "courses" exist:
      | fullname | shortname | category |
      | Course 1 | C1        | 0        |
    And the following "activities" exist:
      | activity | name       | intro      | introformat | course | content                                                                         | contentformat | idnumber |
      | page     | PageName1  | PageDesc1  | 1           | C1     | <p>{mlang en}Some plain text{mlang}</p><p>{mlang de}Ein anderer Text{mlang}</p> | 1             | 1        |

  Scenario: Remove the english language tag via context menu.
    When I am on "Course 1" course homepage
    And I am on the "PageName1" "page activity editing" page logged in as admin
    And I navigate to "Settings" in current page administration
    And I expand all fieldsets
    And I click "Remove" in the context menu for the mlang tag "2" of the "Page content" TinyMCE editor
    And I click on "Save and display" "button"
    Then I should see "Some plain text"
    And I should see "Ein anderer Text"

  Scenario: Exchange the german and the english language tag via context menu.
    When I am on "Course 1" course homepage
    And I am on the "PageName1" "page activity editing" page logged in as admin
    And I navigate to "Settings" in current page administration
    And I expand all fieldsets
    And I click "en" in the context menu for the mlang tag "2" of the "Page content" TinyMCE editor
    And I click "de" in the context menu for the mlang tag "1" of the "Page content" TinyMCE editor
    And I click on "Save and display" "button"
    Then I should not see "Some plain text"
    And I should see "Ein anderer Text"
