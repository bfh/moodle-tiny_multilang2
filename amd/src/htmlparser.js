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
 * Handling of the editor content to add and remove the visual styling and
 * helper nodes to modify language settings.
 *
 * @module      tiny_multilang2
 * @copyright   2024 Stephan Robotta <stephan.robotta@bfh.ch>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {spanMultilangBegin, spanMultilangEnd, blockTags} from './constants';

/**
 * This class is used to parse HTML content and call a callback function
 * when a tag is opened, closed or text is found.
 */
class HTMLParser {
    constructor() {
        this.onTagOpen = null;
        this.onTagClose = null;
        this.onText = null;
        this.chunk = '';
        this.parse = function(input) {
            let content = input;
            while (content.length > 0) {
                let match = content.match(/<[^>]*>/);
                if (match) {
                    let index = match.index;
                    if (index > 0) {
                        this.chunk = content.substring(0, index);
                        if (typeof this.onText === 'function') {
                            this.onText(this.chunk);
                        }
                    }
                    this.chunk = match[0];
                    if (match[0].charAt(1) === '/') {
                        if (typeof this.onTagClose === 'function') {
                            this.onTagClose(match[0].substring(2, match[0].length - 1).trim());
                        }
                    } else if (typeof this.onTagOpen === 'function') {
                        const attr1 = this.mapAttrs(match[0].match(/([\w\-_]+)="([^"]*)"/g));
                        const attr2 = this.mapAttrs(match[0].match(/([\w\-_]+)='([^']*)'/g));
                        const tag = match[0].match(/^<(\w+)/);
                        this.onTagOpen(tag[1].toLowerCase(), {...attr1, ...attr2});
                    }
                    content = content.substring(index + match[0].length);
                } else {
                    if (typeof this.onText === 'function') {
                        this.onText(content);
                    }
                    this.chunk = content;
                    content = '';
                }
            }
        };
        this.getChunk = function() {
            return this.chunk;
        };
        this.mapAttrs = function(attrs) {
            let res = {};
            if (attrs) {
                for (let i = 0; i < attrs.length; i++) {
                    let [k, v] = attrs[i].split('=');
                    res[k] = v ? v.substring(1, v.length) : null;
                }
            }
            return res;
        };
    }
}

export const parseEditorContent = function(html) {
    let newHtml = '';
    let mlang = 0;
    let inClose = false;
    const parser = new HTMLParser();
    parser.onTagOpen = function(tag, attr) {
        if (tag === 'span' && attr.class && attr.class.indexOf('multilang-begin') > -1) {
            mlang++;
        } else if (tag === 'span' && attr.class && attr.class.indexOf('multilang-end') > -1) {
            mlang--;
            inClose = true;
        }
        newHtml += parser.getChunk();
    };
    parser.onTagClose = function(tag) {
        if (blockTags.indexOf(tag) > -1 && mlang != 0) {
            if (mlang > 0) {
                newHtml += spanMultilangEnd;
                mlang--;
            } else {
                const t = newHtml.lastIndexOf(spanMultilangEnd);
                newHtml = newHtml.substring(0, t)
                    + spanMultilangBegin.replace(new RegExp('%lang', 'g'), 'other')
                    + newHtml.substring(t);
                mlang++;
            }
            return;
        }
        if (tag === 'span' && inClose) {
            inClose = false;
        }
        newHtml += parser.getChunk();
    };
    parser.onText = function(text) {
        if (mlang > 0 || inClose) {
            newHtml += text;
            return;
        }
        const intermediateReplacements = [];
        // eslint-disable-next-line no-constant-condition
        while (1) {
            const m = text.match(new RegExp('{\\s*mlang(\\s+([^}]+?))?\\s*}', 'i'));
            if (!m) {
                break;
            }
            const textBefore = text.substring(0, m.index);
            const textAfter = text.substring(m.index + m[0].length);
            let r = m[0];
            if (!m[2]) {
                r = spanMultilangEnd;
                mlang--;
            } else {
                r = spanMultilangBegin.replace(new RegExp('%lang', 'g'), m[2]);
                mlang++;
            }
            intermediateReplacements.push(r);
            text = `${textBefore}___~~${intermediateReplacements.length}~~___${textAfter}`;
        }
        // Revert all placeholders back to the original {mlang} tags.
        for (let i = 0; i < intermediateReplacements.length; i++) {
            text = text.replace(`___~~${i + 1}~~___`, intermediateReplacements[i]);
        }
        newHtml += text;
    };
    parser.parse(html);
    return newHtml;
};
