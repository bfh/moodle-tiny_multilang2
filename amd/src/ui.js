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

import {getHighlightCss, isContentToHighlight, mlangFilterExists, isFallbackSpanTag} from './options';

// This class inside a <span> identified the {mlang} tag that is encapsulated in a span.
const spanClass = 'multilang-begin mceNonEditable';
// This is the <span> element with the data attribute.
const spanFixedAttrs = '<span contenteditable="false" class="' + spanClass + '" data-mce-contenteditable="false"';
// The begin span needs the language attributes inside the span and the mlang attribute.
const spanMultilangBegin = spanFixedAttrs + ' lang="%lang" xml:lang="%lang">{mlang %lang}</span>';
// The end span doesn't need information about the used language.
const spanMultilangEnd = spanFixedAttrs.replace('begin', 'end') + '>{mlang}</span>';
// Fallback span that is used instead of the {mlang} annotation.
const spanFallbackLang = '<span class="multilang" lang="%lang">';
// Helper functions
const trim = v => v.toString().replace(/^\s+/, '').replace(/\s+$/, '');
const isNull = a => a === null || a === undefined;

// Marker to remember when the blur event occurred.
let isBlurred = false;

/**
 * Convert {mlang xx} and {mlang} strings to spans, so we can style them visually.
 * Remove superflous whitespace while at it.
 * @param {tinymce.Editor} ed
 * @param {string|null} content
 * @return {string}
 */
const addVisualStyling = function(ed, content) {
    if (isNull(content)) {
        content = ed.getContent();
    }

    // Do not use a variable whether text is already highlighted, do a check for the existing class
    // because this is safe for many tiny element windows at one page.
    if (content.indexOf(spanClass) !== -1) {
        return content;
    }

    // First look for any {mlang} tags in the content string and do a preg_replace with the corresponding
    // <span> tag that encapsulated the {mlang} tag so that the {mlang} is highlighted.
    content = content.replace(new RegExp('{\\s*mlang\\s+([^}]+?)\\s*}', 'ig'), function(match, p1) {
        return spanMultilangBegin.replace(new RegExp('%lang', 'g'), p1);
    });
    content = content.replace(new RegExp('{\\s*mlang\\s*}', 'ig'), spanMultilangEnd);

    // If we have the multilang2 filter installed and wish not to check for the traditional
    // <span class="multilang"> tags, then we are done here.
    if (mlangFilterExists(ed) && !isFallbackSpanTag(ed)) {
        return content;
    }
    // Any <span class="multilang"> tag must be replaced with a <span class="multilang-begin...>{mlang XX}</span>
    // and the corresponding closing </span> must be replaced by <span class="multilang-end ...>{mlang}</span>.
    // To handle this, we must convert the string into a DOMDocument so that any span.multilang tag can be searched
    // and replaced.
    const dom = new DOMParser();
    const doc = dom.parseFromString(content, 'text/html');
    if (doc.children.length === 0) { // Should not happen, but anyway, keep the check.
        return content;
    }
    const nodes = doc.querySelectorAll('span.multilang');
    if (nodes.length === 0) {
        return content;
    }
    for (const span of nodes) {
        const newSpan = spanMultilangBegin
            .replace(new RegExp('%lang', 'g'), span.getAttribute('lang'))
            .replace('mceNonEditable', 'mceNonEditable fallback')
          + span.innerHTML
          + spanMultilangEnd
            .replace('mceNonEditable', 'mceNonEditable fallback');
        // Insert the replacement string after the span tag itself by converting it into a html fragment.
        span.insertAdjacentHTML('afterend', newSpan);
        // Once the new tags are placed at the correct position, we can remove the original span tag.
        span.remove();
    }
    // Convert the DOMDocument into a string again.
    return doc.getElementsByTagName('body')[0].innerHTML;
};

/**
 * Remove the spans we added in _add_visual_styling() to leave only the {mlang xx} and {mlang} tags.
 * Also make sure we lowercase the multilang 'tags'
 * @param {tinymce.Editor} ed
 */
const removeVisualStyling = function(ed) {
    ['begin', 'end'].forEach(function(t) {
        for (const span of ed.dom.select('span.multilang-' + t)) {
            if (t === 'begin' && span.classList.contains('fallback')) {
                // This placeholder tag was created from an oldstyle <span class="multilang"> tag.
                let innerHTML = '';
                let end = span;
                let toRemove = [];
                // Search the corresponding closing tag.
                while (end) {
                    end = end.nextSibling;
                    if (isNull(end)) { // Got a parent that does not exist. Stop here.
                        break;
                    }
                    if (!isNull(end.classList) && end.classList.contains('multilang-end')) {
                        // We found the multilang-end node, that needs to be removed, and also, we can stop here.
                        toRemove.push(end);
                        break;
                    }
                    // Sibling inside the tags need to be preserved, but moved to the innerHTML of the real
                    // span tag. Therefore, collect the node content as string and remember the real nodes
                    // to remove them later.
                    if (end.nodeType === 3) {
                        innerHTML += end.nodeValue;
                    } else if (end.nodeType === 1) {
                        innerHTML += end.outerHTML;
                    }
                    toRemove.push(end);
                }
                if (!isNull(end)) {
                    // Extract the language from the {mlang XX} tag.
                    const lang = span.innerHTML.match(new RegExp('{\\s*mlang\\s+([^}]+?)\\s*}', 'i'));
                    if (lang) {
                        // Create the new <span class="multilang"> tag with the content.
                        ed.dom.setOuterHTML(
                          span,
                          '<span class="multilang" lang="' + lang[1] + '">' + innerHTML + '</span>'
                        );
                        // And remove the other siblings.
                        for (end of toRemove) {
                            ed.dom.remove(end);
                        }
                    }
                }
            } else {
                // Normal placeholder tag, just restore the innerHTML that is {mlang XX} or {mlang}-
                ed.dom.setOuterHTML(span, span.innerHTML.toLowerCase());
            }
        }
    });
};

/**
 * At the current selection lookup for the current node. If we are inside a special span that encapsulates
 * the {lang} tag, then look for the corresponding opening or closing tag, depending on what's set in the
 * search param.
 * @param {tinymce.Editor} ed
 * @param {string} search
 * @return {Node|null} The encapsulating span tag if found.
 */
const getHighlightNodeFromSelect = function(ed, search) {
    let span;
    ed.dom.getParents(ed.selection.getStart(), elm => {
        // Are we in a span that highlights the lang tag.
        if (!isNull(elm.classList)) {
            // If we are on an opening/closing lang tag, we need to search for the corresponding opening/closing tag.
            const pair = search === 'begin' ? 'end' : 'begin';
            if (elm.classList.contains('multilang-' + pair)) {
                span = elm;
                do {
                    // If we look for begin, go back siblings, otherwise look fnext siblings until end is found.
                    span = search === 'begin' ? span.previousSibling : span.nextSibling;
                } while (!isNull(span) && (isNull(span.classList) || !span.classList.contains('multilang-' + search)));
            } else if (elm.classList.contains('multilang-' + search)) {
                // We are already on the correct tag we search for
                span = elm;
            }
        }
    });
    return span;
};

/**
 * When loading the editor for the first time, add the spans for highlighting the content.
 * @param {tinymce.Editor} ed
 */
const onInit = function(ed) {
    if (isContentToHighlight(ed)) {
        ed.dom.addStyle(getHighlightCss(ed));
        ed.setContent(addVisualStyling(ed));
    }
};

/**
 * When the source code view dialogue is show, we must remove the highlight spans from the editor content
 * and also add them again when the dialogue is closed.
 * Since this event is also triggered when the editor data is saved, we use this function to remove the
 * highlighting content at that time.
 * @param {tinymce.Editor} ed
 * @param {object} content
 */
const onBeforeGetContent = function(ed, content) {
    if (!isNull(content.source_view) && content.source_view === true) {
        // If the user clicks on 'Cancel' or the close button on the html
        // source code dialog view, make sure we re-add the visual styling.
        var onClose = function(ed) {
            ed.off('close', onClose);
            ed.setContent(addVisualStyling(ed));
        };
        ed.on('CloseWindow', () => {
            onClose(ed);
        });

        if (isContentToHighlight(ed)) {
            removeVisualStyling(ed);
        }
    }
};

/**
 * Before saving and when the editor looses the focus, this event is triggered.
 * @param {tinymce.Editor} ed
 * @param {object} content
 * @param {string} event
 */
const onProcess = function(ed, content, event) {
    if (!isNull(content.save) && content.save === true && isContentToHighlight(ed)) {
        if (event === 'PostProcess') {
            // When the blur event was triggered, the editor is still there, we need to reapply
            // the previously removed styling. If this was a submit event, then do not reapply the
            // styling to prevent that this is saved in the database.
            if (isBlurred) {
                ed.setContent(addVisualStyling(ed));
                isBlurred = false;
            }
        } else {
            removeVisualStyling(ed);
        }
    }
};


/**
 * Notice that when the editor content is blurred, because the focus left the editor window.
 */
const onBlur = function() {
    isBlurred = true;
};

/**
 * Check for key press <del> when something is deleted. If that happens inside a highlight span
 * tag, then remove this tag and the corresponding that open/closes this lang tag.
 * @param {tinymce.Editor} ed
 * @param {Object} event
 */
const onDelete = function(ed, event) {
    if (event.isComposing || (event.keyCode !== 46 && event.keyCode !== 8) || !isContentToHighlight(ed)) {
        return;
    }
    // Key <del> was pressed, to delete some content. Check if we are inside a span for the lang.
    const begin = getHighlightNodeFromSelect(ed, 'begin');
    const end = getHighlightNodeFromSelect(ed, 'end');
    // Only if both, start and end tag are found, then delete the nodes here and prevent the default handling
    // because the stuff to be deleted is already gone.
    if (!isNull(begin) && !isNull(end)) {
        event.preventDefault();
        ed.dom.remove(begin);
        ed.dom.remove(end);
    }
};

/**
 * The action when a language icon or menu entry is clicked. This adds the {mlang} tags at the current content
 * position or around the selection.
 * @param {tinymce.Editor} ed
 * @param {string} iso
 */
const applyLanguage = function(ed, iso) {
    if (iso === null) {
        return;
    }
    const regexLang = /%lang/g;
    let text = ed.selection.getContent();
    // Selection is empty, just insert the lang opening and closing tag
    // together with a space where the user may add the content.
    if (trim(text) === '') {
        let newtext;
        if (isContentToHighlight(ed)) {
            newtext = spanMultilangBegin.replace(regexLang, iso) + ' ' + spanMultilangEnd;
            if (!mlangFilterExists(ed)) { // No mlang filter, add the fallback class to the highlight spans.
                newtext = newtext.replaceAll('mceNonEditable', 'mceNonEditable fallback');
            }
        } else if (mlangFilterExists(ed)) { // No content to highlight but mlang filter exists.
            newtext = '{mlang ' + iso + '} {mlang}';
        } else { // No content and also no mlang filter exists.
            newtext = spanFallbackLang.replace(regexLang, iso) + ' </span>';
        }
        ed.insertContent(newtext);
        return;
    }
    // Selection contains something, we need to place the open and closing lang tags around the selection.
    // However, there are a few exceptions, e.g. when the selection is inside the lang tag itself. In this case
    // just change the tag without encapsulating the selection.
    if (!isContentToHighlight(ed)) {
        if (mlangFilterExists(ed)) {
            ed.selection.setContent('{mlang ' + iso + '}' + text + '{mlang}');
        } else {
            ed.selection.setContent(spanFallbackLang.replace(regexLang, iso) + text + '</span>');
        }
        return;
    }
    // Syntax highlighting is on. Check if we are on a special span that encapsulates the language tags. Search
    // for the start span tag.
    const span = getHighlightNodeFromSelect(ed, 'begin');
    // If we have a span, then it's the opening tag, and we just replace this one with the new iso.
    if (!isNull(span)) {
        let replacement = spanMultilangBegin.replace(regexLang, iso);
        if (span.classList.contains('fallback')) {
            replacement = replacement.replace('mceNonEditable', 'mceNonEditable fallback');
        }
        ed.dom.setOuterHTML(span, replacement);
        return;
    }
    // Not inside a lang tag, insert a new opening and closing tag with the selection inside.
    let newtext = spanMultilangBegin.replace(regexLang, iso) + text + spanMultilangEnd;
    if (!mlangFilterExists(ed)) { // No mlang filter, add the fallback class to the highlight spans.
        newtext = newtext.replaceAll('mceNonEditable', 'mceNonEditable fallback');
    }
    ed.selection.setContent(newtext);
};


export {
    onInit,
    onBeforeGetContent,
    onProcess,
    onBlur,
    onDelete,
    applyLanguage
};