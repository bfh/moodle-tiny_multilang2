import {getHighlightCss, isContentToHighlight} from "./options";


let _already_highlighted = 0;
const _span_fixed_attrs = 'class="multilang-begin mceNonEditable" data-mce-contenteditable="false"';
const _span_multilang_begin = '<span ' + _span_fixed_attrs + ' lang="%lang" xml:lang="%lang">{mlang %lang}</span>';
const _span_multilang_end = '<span ' + _span_fixed_attrs.replace('begin', 'end') + '>{mlang}</span>';

const trim = v => v.toString().replace(/^\s+/, '').replace(/\s+$/, '');

/**
 * Convert {mlang xx} and {mlang} strings to spans, so we can style them visually.
 * Remove superflous whitespace while at it.
 * @param {tinymce} ed
 * @param {string} content
 */
const _add_visual_styling = function(ed, content) {
    if (_already_highlighted){
        return content;
    }

    if (!content) {
        content = ed.getContent();
    }

    // Work around for Chrome behaviour: apparently we can't do the .replace() on the
    // _span_multilang_begin property, so we use a temporary variable instead.
    let begin_str = _span_multilang_begin;
    content = content.replace(new RegExp('{\\s*mlang\\s+([^}]+?)\\s*}', 'ig'), function(match, p1) {
        return begin_str.replace(new RegExp('%lang', 'g'), p1);
    });
    content = content.replace(new RegExp('{\\s*mlang\\s*}', 'ig'), _span_multilang_end);

    _already_highlighted = 1;
    return content;
};

/**
 * Remove the spans we added in _add_visual_styling() to leave only the {mlang xx} and {mlang} tags.
 * Also make sure we lowercase the multilang 'tags'
 * @param {tinymce} ed
 */
const _remove_visual_styling = function(ed) {
    if (!_already_highlighted) {
      return;
    }
    ['begin', 'end'].forEach(function (t) {
      let nodes = ed.dom.select('span.multilang-' + t);
      for (let n = 0, l = nodes.length; n < l; n++) {
        const span = nodes[n];
        ed.dom.setOuterHTML(span, span.innerHTML.toLowerCase());
      }
    });
    _already_highlighted = 0;
};

const onInit = function(ed) {
    if (isContentToHighlight(ed)) {
        ed.dom.addStyle(getHighlightCss(ed));
        ed.setContent(_add_visual_styling(ed, ed.getContent()));
    }
};

const onBeforeGetContent = function(ed, o) {
  if (typeof o.source_view !== 'undefined' && o.source_view) {
    // If the user clicks on 'Cancel' or the close button on the html
    // source code dialog view, make sure we re-add the visual styling.
    var onClose = function(window) {
      var ed = window.editor;
      ed.windowManager.onClose.remove(onClose);
      ed.setContent(_add_visual_styling(ed, ed.getContent()));
    };
    ed.windowManager.onClose.add(onClose);

    if (isContentToHighlight(ed)) {
        _remove_visual_styling(ed);
    }
  }
};

const onBeforeSetContent = function(ed, o) {
  if (typeof o.source_view !== 'undefined' && o.source_view) {
    if (isContentToHighlight(ed)) {
      o.content = _add_visual_styling(ed, o.content);
    }
  }
};

// Add an observer to the onPreProcess event to remove the highlighting spans while saving the content.
const onPreProcess = function(ed, o) {
  if (typeof o.save !== 'undefined' && o.save) {
    if (isContentToHighlight(ed)) {
      _remove_visual_styling(ed);
      // Even if we have called _remove_visual_styling(), we are actually working
      // on a copy of the content here. The original content of the editor is still
      // highlighted, so keep the right state for _already_highlighted.
      _already_highlighted = 1;
    }
  }
};

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
        newtext = '{mlang ' + iso +'}' + text + '{mlang}';
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
    onBeforeSetContent,
    onPreProcess,
    applyLanguage
};