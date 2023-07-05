@editor @editor_tiny @tiny @tiny_multilang2 @javascript
Feature: Tiny editor multilang plugin for default behaviour with no multilangfilter2 installed
  To put content in Tiny in different languages, I use the language button to encapsulate the text in language tags.

  Background: I login as admin and add a text to the description with two paragraphs.
    Given the following config values are set as admin:
      | requiremultilang2 | 0 | tiny_multilang2 |
      | highlight | 1 | tiny_multilang2 |
      | fallbackspantag | 1 | tiny_multilang2 |
    And the following "language packs" exist:
      | language |
      | de       |
    And the "multilang" filter is "on"
    And the "multilang" filter applies to "content"
    And the following "courses" exist:
      | fullname | shortname | category |
      | Course 1 | C1        | 0        |
     And the following "activities" exist:
      | activity | name       | intro      | introformat | course | content                                       | contentformat | idnumber |
      | page     | PageName1  | PageDesc1  | 1           | C1     | <p>Some plain text</p><p>Ein anderer Text</p> | 1             | 1        |
    And I log in as "admin"
    And I am on "Course 1" course homepage with editing mode off
    And I am on the "PageName1" "page activity" page
    Then I should see "Some plain text"
    And I should see "Ein anderer Text"

  Scenario: I login as admin and select the paragraphs and set the language to english and german
    When I am on "Course 1" course homepage
    And I am on the "PageName1" "page activity" page
    And I navigate to "Settings" in current page administration
    And I click on "//a[@id='collapseElement-0']" "xpath_element"
    And I select the inner "p" element in position "0" of the "Page content" TinyMCE editor
    And I click on the "Format > Language > English (en)" submenu item for the "Page content" TinyMCE editor
    And I click on "//h1" "xpath_element"
    And I select the inner "p" element in position "1" of the "Page content" TinyMCE editor
    And I click on the "Format > Language > Deutsch (de)" submenu item for the "Page content" TinyMCE editor
    And I press "Save and display"
    # Because the two texts are in different nodes, we are only able to check that the <span> elements have been applied.
    Then I should see "Some plain text" in the "//span[@lang='en'][1]" "xpath_element"
    And I should see "Ein anderer Text" in the "//span[@lang='de'][1]" "xpath_element"
    And I navigate to "Settings" in current page administration
    And I click on "//a[@id='collapseElement-0']" "xpath_element"
    And I select the "span" element in position "2" of the "Page content" TinyMCE editor
    And I click on the "Format > Language > English (en)" submenu item for the "Page content" TinyMCE editor
    And I press "Save and display"
    Then I should see "Some plain text" in the "//p[1]/span[@lang='en']" "xpath_element"
    And I should see "Ein anderer Text" in the "//p[2]/span[@lang='en']" "xpath_element"
