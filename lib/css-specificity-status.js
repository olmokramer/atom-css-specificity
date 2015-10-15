'use babel';
import 'object-assign-shim';

import {calculate as calculateSpecificity} from 'specificity';

import {CompositeDisposable} from 'atom';

import {showDetailView} from './main.js';

import {addEventListener, isCSSTextEditor, isActiveTextEditor} from './utils.js';

var tagName = 'css-specificity-status';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('inline-block');

    this.link = this.appendChild(document.createElement('a'));
    this.link.classList.add('inline-block');

    this.disposables = new CompositeDisposable();
    this.disposables.add(
      atom.workspace.observeActivePaneItem(paneItem =>
        this.update(paneItem)
      ),
      atom.workspace.observeTextEditors(textEditor => {
        this.registerTextEditor(textEditor);
      }),
      addEventListener(this.link, 'click', () =>
        showDetailView()
      ),
    );
  },

  destroy() {
    this.disposables.dispose();
  },

  registerTextEditor(textEditor) {
    if(!isCSSTextEditor(textEditor)) return;

    var textEditorDisposable = new CompositeDisposable(
      textEditor.onDidChangeCursorPosition(() =>
        this.update(textEditor)
      ),
      textEditor.onDidAddCursor(() =>
        this.update(textEditor)
      ),
      textEditor.onDidRemoveCursor(() =>
        this.update(textEditor)
      ),
      textEditor.onDidStopChanging(() =>
        this.update(textEditor)
      ),
      textEditor.onDidChangeGrammar(() =>
        this.disposeTextEditor(textEditorDisposable)
      ),
      textEditor.onDidDestroy(() =>
        this.disposeTextEditor(textEditorDisposable)
      ),
    );

    this.disposables.add(textEditorDisposable);
  },

  disposeTextEditor(textEditorDisposable) {
    textEditorDisposable.dispose();
    this.disposables.remove(textEditorDisposable);
  },

  show() {
    this.style.display = '';
  },

  hide() {
    this.style.display = 'none';
  },

  update(textEditor) {
    if(!isCSSTextEditor(textEditor) || !isActiveTextEditor(textEditor))
      return this.hide();

    this.currentSelector = this.getSelectors(textEditor);
    var {specificity} = calculateSpecificity(this.currentSelector)[0] || {};

    if(!specificity) return this.hide();

    this.link.innerHTML = `Specificity: ${specificity}`;
    this.show();
  },

  getSelectors(textEditor) {
    // selectors is an array of arrays
    var selectors = textEditor.getCursorBufferPositions().map(cursorPosition =>
      this.getSelectorForCursorPosition(textEditor, cursorPosition)
    );
    // merge the arrays in selectors
    selectors = Array.prototype.concat.apply([], selectors);
    // filter duplicate selectors
    return selectors.filter((selector, i) =>
      selectors.indexOf(selector) == i
    ).join(',');
  },

  getSelectorForCursorPosition(textEditor, cursorPosition) {
    var CSSBlock = textEditor.getTextInBufferRange([
      this.findNextClosingBracketBufferPosition(textEditor, cursorPosition, true) || [0, 0],
      this.findNextClosingBracketBufferPosition(textEditor, cursorPosition) || [Infinity, 0],
    ]);

    // strip comments
    CSSBlock = CSSBlock.replace(/\/\*(.|\s)+?\*\//g, '');

    // strip everything after opening bracket
    var selector = CSSBlock.match(/^\s*([^{]*)/)[1];

    // split into comma separated parts
    return selector.split(',').map(part => part.trim());
  },

  findNextClosingBracketBufferPosition(textEditor, cursorPosition, reverse = false) {
    var scanRange = reverse ? [[0, 0], cursorPosition] : [cursorPosition, [Infinity, 0]];
    var result;

    textEditor[reverse ? 'backwardsScanInBufferRange' : 'scanInBufferRange'](/}/g, scanRange, ({range, stop}) => {
      var scopeDescriptor = textEditor.scopeDescriptorForBufferPosition(range.start);
      if(scopeDescriptor.getScopesArray().join(' ').search('comment') > -1) return;

      stop();
      result = range.start.translate([0, 1]);
    });

    return result;
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function cssSpecificityStatus() {
  return document.createElement(tagName);
}
