import {expect, test} from '@jest/globals';
import {parseEditorContent} from './src/htmlparser.mjs';

test('html 1', () => {
    const html = '<p class="clo">{mlang de}</p><div>Foo bar {mlang}</div>';
    const parsed = '<p class="clo"><span contenteditable="false" class="multilang-begin mceNonEditable" '
        + 'data-mce-contenteditable="false" lang="de" xml:lang="de">{mlang de}</span>'
        + '<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>'
        + '<div>Foo bar <span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" '
        + 'lang="other" xml:lang="other">{mlang other}</span><span contenteditable="false" class="multilang-end mceNonEditable" '
        + 'data-mce-contenteditable="false">{mlang}</span>';
    expect(parseEditorContent(html)).toEqual(parsed);
});

test('html 2', () => {
    const html = '<div>Foo bar {mlang}</div>';
    const parsed = '<div>Foo bar <span contenteditable="false" class="multilang-begin mceNonEditable" '
        + 'data-mce-contenteditable="false" lang="other" xml:lang="other">{mlang other}</span>'
        + '<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>';
    expect(parseEditorContent(html)).toEqual(parsed);
});

test('html 3', () => {
    const html = `<p>{mlang en}This is a test{mlang}{mlang de}Das ist ein Test{mlang}.</p>
<p>This is a multilang link: <a
    href="https://google.com?lang={mlang de}de-DE{mlang}{mlang en}en-EN{mlang}" target="_blank">{mlang
    de}de{mlang}{mlang en}other{mlang}</a></p>
<p>{mlang de}</p>
<p>ein Paragraf auf Deutch</p>
<br><hr strong/>
<p class="clo">{mlang}</p>
<p>{mlang other}This is <b>a</b> test{mlang}{mlang de}Das ist ein Test{mlang}.</p>
<p>{mlang en}This is a test{mlang}{mlang de}Das ist ein Test{mlang}.</p>
<p><span contenteditable="false" class="multilang-begin mceNonEditable"
data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>English rules<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span></p>`;
    const parsed = `<p><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>This is a test<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="de" xml:lang="de">{mlang de}</span>Das ist ein Test<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>.</p>
<p>This is a multilang link: <a
    href="https://google.com?lang={mlang de}de-DE{mlang}{mlang en}en-EN{mlang}" target="_blank"><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="de" xml:lang="de">{mlang de}</span>de<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>other<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span></a></p>
<p><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="de" xml:lang="de">{mlang de}</span><span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>
<p>ein Paragraf auf Deutch</p>
<br><hr strong/>
<p class="clo"><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="other" xml:lang="other">{mlang other}</span><span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>
<p><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="other" xml:lang="other">{mlang other}</span>This is <b>a</b> test{mlang}{mlang de}Das ist ein Test{mlang}.<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>
<p><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>This is a test<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span><span contenteditable="false" class="multilang-begin mceNonEditable" data-mce-contenteditable="false" lang="de" xml:lang="de">{mlang de}</span>Das ist ein Test<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span>.</p>
<p><span contenteditable="false" class="multilang-begin mceNonEditable"
data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>English rules<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span></p>`;
    expect(parseEditorContent(html)).toEqual(parsed);
});
test('html 4', () => {
    const html = `<p><span contenteditable="false" class="multilang-begin mceNonEditable"
data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>English rules<span contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span></p>`;
    const parsed = '<p><span contenteditable="false" class="multilang-begin mceNonEditable"\n'
        + 'data-mce-contenteditable="false" lang="en" xml:lang="en">{mlang en}</span>English rules<span '
        + 'contenteditable="false" class="multilang-end mceNonEditable" data-mce-contenteditable="false">{mlang}</span></p>';
    expect(parseEditorContent(html)).toEqual(parsed);
});