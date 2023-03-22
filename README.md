TinyMCE multilanguage plugin
============================

![Release](https://img.shields.io/badge/release-v0.1.0-blue.svg) ![Supported](https://img.shields.io/badge/supported-4.1%2C%204.2-green.svg)

This plugin will make the creation of multilingual contents on Moodle much more easier with the TinyMCE editor.

The plugin is developed to work with [Iñaki Arenaza's multilang2 filter](https://github.com/iarenaza/moodle-filter_multilang2), and this plugin is the adaption 
on [his plugin for TinyMCE editor](https://github.com/iarenaza/moodle-tinymce_moodlelang2) and will work with TinyMCE 6

## Current version

The latest release is v0.1.0 (build 2023031200) for Moodle 4.x

## Requirements
As mentioned before, [filter_multilang2](https://github.com/iarenaza/moodle-filter_multilang2) is required.

## Installation

 - Copy repository content in *moodleroot*/lib/editor/tiny/plugins. The following can be omitted:
   - tests/ (if you're not going to test it with Behat)
   - .gitmodules
   - build.xml
 - Install the plugin from Moodle. 
