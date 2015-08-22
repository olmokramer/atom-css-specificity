'use babel';
import 'object-assign-shim';

import {
  calculate as calculateSpecificity,
} from 'specificity';

import {
  CompositeDisposable,
} from 'atom';

import {
  showDetailView,
} from './main.js';

import cssSpecificityDetail from './css-specificity-detail.js';

import {
  addEventListener,
  isCSSTextEditor,
} from './utils.js';

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
        if(!isCSSTextEditor(textEditor)) return;

        var textEditorDisposable = new CompositeDisposable(
          textEditor.onDidChangeCursorPosition(() =>
            this.update(textEditor)
          ),

          textEditor.onDidStopChanging(() =>
            this.update(textEditor)
          ),

          textEditor.onDidDestroy(() => {
            textEditorDisposable.dispose();
            this.disposables.remove(textEditorDisposable);
          }),
        );

        this.disposables.add(textEditorDisposable);
      }),

      addEventListener(this.link, 'click', () =>
        showDetailView()
      ),
    );
  },

  destroy() {
    this.disposables.dispose();
  },

  show() {
    this.style.display = '';
  },

  hide() {
    this.style.display = 'none';
  },

  update(textEditor) {
    if(!isCSSTextEditor(textEditor)) return this.hide();

    this.currentSelector = this.getSelector(textEditor);
    var { specificity } = calculateSpecificity(this.currentSelector)[0] || {};

    if(!specificity) return this.hide();

    this.link.innerHTML = `Specificity: ${specificity}`;
    this.show();
  },

  getSelector(textEditor) {
    var cursorPosition = textEditor.getCursorBufferPosition();
    var previousRange;
    var targetRange;

    textEditor.scan(/}/g, ({range, stop}) => {
      if(range.start.isGreaterThan(cursorPosition)) {
        stop();
        targetRange = [
          previousRange ? previousRange.start.translate([0, 1]) : [0, 0],
          range.start.translate([0, 1]),
        ];
      }
      previousRange = range;
    });

    if(!targetRange) return '';

    return textEditor.getTextInBufferRange(targetRange).match(/^\s*([^{]*)/)[1];
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function cssSpecificityStatus() {
  return document.createElement(tagName);
}
