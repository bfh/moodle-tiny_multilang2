<?php
// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

namespace tiny_multilang2;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_menuitems;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;

defined('MOODLE_INTERNAL') || die;

require_once(__DIR__ . '/../../../../../behat/classes/util.php');

/**
 * Plugin for Moodle 'Multilingual content' drop down menu in TinyMCE 6.
 *
 * @package     tiny_multilang2
 * @author      Iñaki Arenaza <iarenaza@mondragon.edu>
 * @author      Stephan Robotta <stephan.robotta@bfh.ch>
 * @copyright   2015 onwards Iñaki Arenaza & Mondragon Unibertsitatea
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_menuitems, plugin_with_buttons, plugin_with_configuration {

    /**
     * There is a config setting that can be set to true for testing purposes so that even though the
     * multilang2 filter is missing, the behat tests can be executed pretending that the multilang2 filter
     * is installed.
     * @return  bool
     */
    public static function is_multilang2_simulated_for_test(): bool {
        return \behat_util::is_test_site() && get_config('tiny_multilang2', 'simulatemultilang2');
    }

    /**
     * Check if user has sufficient rights to use the plugin.
     *
     * @param context $context
     * @param array $options
     * @param array $fpoptions
     * @param editor|null $editor
     * @return bool
     * @throws \coding_exception
     */
    public static function is_enabled(
        context $context,
        array $options,
        array $fpoptions,
        ?\editor_tiny\editor $editor = null
    ): bool {
        // Users must have permission to embed content.
        return has_capability('tiny/multilang2:viewlanguagemenu', $context);
    }

    /**
     * Get a list of the menu items provided by this plugin.
     *
     * @return string[]
     */
    public static function get_available_menuitems(): array {
        return [
            'tiny_multilang2',
        ];
    }

    /**
     * Get a list of the buttons provided by this plugin.
     * @return string[]
     */
    public static function get_available_buttons(): array {
        return [
            'tiny_multilang2',
        ];
    }

    /**
     * Returns the configuration values the plugin needs to take into consideration
     *
     * @param context $context
     * @param array $options
     * @param array $fpoptions
     * @param editor|null $editor
     * @return array
     * @throws \dml_exception
     */
    public static function get_plugin_configuration_for_context(context $context, array $options, array $fpoptions,
                                                                ?editor $editor = null): array {

        // Check, if the multilang2 filter is active.
        if (self::is_multilang2_simulated_for_test()) {
            $mlangfilter = true;
        } else {
            $filters = filter_get_active_in_context($context);
            $mlangfilter = array_key_exists('multilang2', $filters);
        }

        // The settings of the languages that are available. If this is empty, the plugin will not be active.
        // Also, add here the information of the existence or absence of the multilang2 filter.
        $config = [
            'languages' => [],
            'mlangfilter' => $mlangfilter,
        ];

        // When the setting to require the multilang2 filter is set to true, and there is no multilang filter.
        if ((bool)get_config('tiny_multilang2', 'requiremultilang2') && !$mlangfilter) {
            return $config;
        }

        // We need to pass the list of languages to tinymce.
        if (get_config('tiny_multilang2', 'showalllangs')) {
            $langs = get_string_manager()->get_list_of_languages();
            foreach (\array_keys($langs) as $iso) {
                $langs[$iso] .= ' (' . $iso . ')';
            }
        } else {
            $langs = get_string_manager()->get_list_of_translations();
        }

        if (count($langs) > 1) {
            asort($langs);
            foreach ($langs as $iso => $label) {
                $config['languages'][] = [
                    'iso' => $iso,
                    'label' => str_replace(["\xe2\x80\x8e", "\xe2\x80\x8f"], '', $label),
                ];
            }
            // Only multilang2 filter allows a general catch all fallback.
            if ($mlangfilter) {
                $config['languages'][] = [
                    'iso' => 'other',
                    'label' => get_string('multilang2:other', 'tiny_multilang2') . ' (other)',
                ];
            }
        }

        $config['fallbackspantag'] = (bool)get_config('tiny_multilang2', 'fallbackspantag');
        $config['highlight'] = (bool)get_config('tiny_multilang2', 'highlight');
        $config['showalllangs'] = (bool)get_config('tiny_multilang2', 'showalllangs');

        if ($config['highlight']) {
            $css = trim(get_config('core', 'highlight_css'));
            if (empty($css)) {
                $css = self::get_default_css();
            }
            $config['css'] = $css;
        }

        return $config;
    }

    /**
     * Return the default css for highlighting {lang} tags when tiny_multilang2 | highlight is
     * set to true.
     * @return string
     */
    public static function get_default_css(): string {
        return '
            .multilang-begin, .multilang-end {
                outline: 1px dotted;
                padding: 0.1em;
                margin: 0em 0.1em;
                background-color: #ffffaa;
            }
        ';
    }

}
