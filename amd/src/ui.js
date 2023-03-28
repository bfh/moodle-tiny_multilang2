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

/**
 * Commands for the plugin logic of the Moodle tiny_multilang2 plugin.
 *
 * @module      tiny_multilang2
 * @author      Iñaki Arenaza <iarenaza@mondragon.edu>
 * @author      Stephan Robotta <stephan.robotta@bfh.ch>
 * @copyright   2015 onwards Iñaki Arenaza & Mondragon Unibertsitatea
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getHighlightCss, isContentToHighlight} from "./options";


// This class inside a <span> identified the {mlang} tag that is encapsulated in a span.
const _span_class = 'class="multilang-begin mceNonEditable"';
// This is the <span> element with the data attribute.
const _span_fixed_attrs = '<span ' + _span_class + ' data-mce-contenteditable="false"';
// The begin span needs the language attributes inside the span and the mlang attribute.
const _span_multilang_begin = _span_fixed_attrs + ' lang="%lang" xml:lang="%lang">{mlang %lang}</span>';
// The end span doesn't need information about the used language.
const _span_multilang_end = _span_fixed_attrs.replace('begin', 'end') + '>{mlang}</span>';
// Helper to trim a string.
const trim = v => v.toString().replace(/^\s+/, '').replace(/\s+$/, '');

/**
 * Convert {mlang xx} and {mlang} strings to spans, so we can style them visually.
 * Remove superflous whitespace while at it.
 * @param {tinymce.Editor} ed
 */
const _add_visual_styling = function(ed) {
    let content = ed.getContent();

    // Do not use a variable whether text is already highlighted, do a check for the existing class
    // because this is safe for many tiny element windows at one page.
    if (content.indexOf(_span_class) !== -1) {
        return content;
    }

    content = content.replace(new RegExp('{\\s*mlang\\s+([^}]+?)\\s*}', 'ig'), function(match, p1) {
        return _span_multilang_begin.replace(new RegExp('%lang', 'g'), p1);
    });
    content = content.replace(new RegExp('{\\s*mlang\\s*}', 'ig'), _span_multilang_end);

    return content;
};

/**
 * Remove the spans we added in _add_visual_styling() to leave only the {mlang xx} and {mlang} tags.
 * Also make sure we lowercase the multilang 'tags'
 * @param {tinymce.Editor} ed
 */
const _remove_visual_styling = function(ed) {
    ['begin', 'end'].forEach(function (t) {
        let nodes = ed.dom.select('span.multilang-' + t);
        for (let n = 0, l = nodes.length; n < l; n++) {
            const span = nodes[n];
            ed.dom.setOuterHTML(span, span.innerHTML.toLowerCase());
        }
    });
};

/**
 * When loading the editor for the first time, add the spans for highlighting the content.
 * @param {tinymce.Editor} ed
 */
const onInit = function(ed) {
    if (isContentToHighlight(ed)) {
        ed.dom.addStyle(getHighlightCss(ed));
        ed.setContent(_add_visual_styling(ed));
    }
};

/**
 * When the source code view dialogue is show, we must remove the highlight spans from the editor content
 * and also add them again when the dialogue is closed.
 * @param {tinymce.Editor} ed
 * @param {object} content
 */
const onBeforeGetContent = function(ed, content) {
    if (typeof content.source_view !== 'undefined' && content.source_view === true) {
        // If the user clicks on 'Cancel' or the close button on the html
        // source code dialog view, make sure we re-add the visual styling.
        var onClose = function(ed) {
            ed.off('close', onClose);
            ed.setContent(_add_visual_styling(ed));
        };
        ed.on('CloseWindow', () => {
            onClose(ed);
        });

        if (isContentToHighlight(ed)) {
            _remove_visual_styling(ed);
        }
    }
};

/**
 * Add an observer to the onPreProcess event to remove the highlighting spans while saving the content.
 * @param {tinymce.Editor} ed
 * @param {Element} node
 */
const onPreProcess = function(ed, node) {
    if (typeof node.save !== 'undefined' && node.save === true) {
        if (isContentToHighlight(ed)) {
            _remove_visual_styling(ed);
        }
    }
};

/**
 * The action when a language icon or menu entry is clicked. This adds the multilang tags at the current content
 * position or around the selection.
 * @param {tinymce.Editor} ed
 * @param {string} iso
 */
const applyLanguage = function(ed, iso) {
    if (iso === null) {
        return;
    }
    let text = ed.selection.getContent();
    let newtext;
    if (trim(text) !== '') {
        if (isContentToHighlight(ed)) {
            newtext = _span_multilang_begin.replace(new RegExp('%lang', 'g'), iso) + text + _span_multilang_end;
        } else {
            newtext = '{mlang ' + iso + '}' + text + '{mlang}';
        }
        ed.selection.setContent(newtext);
    } else {
        if (isContentToHighlight(ed)) {
            newtext = _span_multilang_begin.replace(new RegExp('%lang', 'g'), iso) + ' ' + _span_multilang_end;
        } else {
            newtext = '{mlang ' + iso +'}' + ' ' + '{mlang}';
        }
        ed.insertContent(newtext);
    }
};


export {
    onInit,
    onBeforeGetContent,
    onPreProcess,
    applyLanguage
};