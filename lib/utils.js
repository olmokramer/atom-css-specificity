'use babel';

import {Disposable, TextEditor} from 'atom';

export function addEventListener(el, event, cb) {
  el.addEventListener(event, cb);
  return new Disposable(() => el.removeEventListener(event, cb));
}

export function isCSSTextEditor(textEditor) {
  return textEditor instanceof TextEditor &&
    textEditor.getGrammar() == atom.grammars.grammarForScopeName('source.css');
}

export function isActiveTextEditor(textEditor) {
  return textEditor == atom.workspace.getActiveTextEditor();
}
