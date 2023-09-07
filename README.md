TinyMCE multilanguage plugin
============================

![Release](https://img.shields.io/badge/Release-0.3-blue.svg)
[![Moodle Plugin CI](https://github.com/bfh/moodle-tiny_multilang2/workflows/Moodle%20Plugin%20CI/badge.svg?branch=master)](https://github.com/bfh/moodle-tiny_multilang2/actions?query=workflow%3A%22Moodle+Plugin+CI%22+branch%3Amaster)
![Supported](https://img.shields.io/badge/Moodle-4.1+-orange.svg)
[![License GPL-3.0](https://img.shields.io/github/license/bfh/moodle-tiny_multilang2?color=lightgrey)](https://github.com/bfh/moodle-tiny_multilang2/blob/main/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/bfh/moodle-tiny_multilang2)](https://github.com/bfh/moodle-tiny_multilang2/graphs/contributors)

This plugin will make the creation of multilingual contents on Moodle much easier with the TinyMCE editor.

The plugin is developed to work with the optionally installed 
[Iñaki Arenaza's multilang2 filter](https://github.com/iarenaza/moodle-filter_multilang2).

This plugin was started as an adaption of [Iñaki Arenaza's plugin for legacy TinyMCE editor](https://github.com/iarenaza/moodle-tinymce_moodlelang2)
and has been made to work with TinyMCE 6 that is included in Moodle ≥ 4.1. Further development
of this plugin added support for the builtin multilanguage tags that are suppored in
Moodle core, so that the multilang2 filter is no requirement anymore.

After the installation of the plugin, the TinyMCE shows a new Button (with a globe icon) and a menu entry in the
"Format" section where you can select a language. Clicking on a language entry adds a language opening and closing
tag to your text at the current cursor position. If there is a selection then the language tags are placed around
the selection. In case you use the highlighting option and see the yellow language tags, you may click one of these
tags then select a new language from the menu and that will change the
language of the existing tag. You may also remove it by hitting the backspace
or delete key. This will remove the tag, and it's counterpart in case the
formatting of the text is correct.

## Current version

The latest release is v0.3 (build 2023070600) for Moodle 4.1 and newer.

## Requirements

There are no additional requirements. To benefit from the plugin capabilities
the TinyMCE editor must be used in text area (either set as a user preference or
being the standard editor set by the Moodle site admin). Also, more than one
language must be active in your Moodle.
If you use the plugin with the [multilang2 filter](https://github.com/iarenaza/moodle-filter_multilang2) the
{mlang} tags for the filter are used. If the filter is not installed and the fallback
is enabled, the standard `<span class="multilang">` tags are used.

## Installation

 - Copy repository content in *moodleroot*/lib/editor/tiny/plugins. The following can be omitted:
   - tests/ (if you're not going to test it with Behat)
   - .gitmodules
   - build.xml
 - Install the plugin from Moodle.
 - Optional: Adjust the settings in "Site administration" -> "Plugins" -> "Tiny Multi-Language Content (v2) settings".

## Troubleshooting

If the language selection does not appear in the editor:
 - Check that the multilang2 filter is installed and enabled.
 - If you don't use the multilang2 filter, check that the setting "Support <span> tags" is active.
 - Check that your site has at least two languages installed.

## Version History

### current master

- Fix issue [TinyMCE link plugin does not work properly when multilang2 is installed](https://github.com/bfh/moodle-tiny_multilang2/issues/4).
  Many thanks to [Mario Wehr](https://github.com/mwehr) for his contribution.
- Fix: tag replacement did not work in the same way when highlighting was on or off.
- Fix: additional CSS for highlighting the code was not applied correctly.
- Fix: context menu sometimes inserted empty tags, when another language was selected.
- Fix: if an entire paragraph is selected, language tags are now applied inside the content
  (within te block element)
- New settings: admin may define a list of languages that can be used with the plugin,
  independent whether these are installed or not.
- New option to remove all language tags within the text.
- New feature: `<span>` elements use the `dir` attribute to annotate left to right and
  right to left languages.

Many thanks to [Tai Le Tan](https://github.com/tailetan) from the Open University that
provided a comprehensive [pull request](https://github.com/bfh/moodle-tiny_multilang2/pull/3).

### 0.3

- Support for the standard language tags in Moodle without having to install the [filter_multilang2](https://github.com/iarenaza/moodle-filter_multilang2).
- Tooltip with possible languages is shown when a highlighted language tag is selected (only when `showalllanguages` is off, otherwise the tooltip list would be too long).
- Fix: when the text editor lost the focus the highlighting of the language tags disappeared.
- Fix: the iso code was not displayed in the language list in the menu when `showalllanguages` was enabled.
- Some internal refactoring because of the changes from above that made them necessary.
- Adjust behat tests to test both, standard annotation and multilang2 filter annotation.
- Change code maturity to RC.

### 0.2.3

- Fix links in README file and add license file.

### 0.2.2

- Lift software maturity level to STABLE.
- Adapt CI to test against Moodle 4.2.
- Fix issue [Probably, $string['helplinktext'] = 'Multi-Language Content (v2)'; is needed in the lang strings](https://github.com/bfh/moodle-tiny_multilang2/issues/1).
- Add version history to README file.

### 0.2.1

Initial release
