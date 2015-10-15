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

export function highlightSelector(selector, parts) {
  for(let part of parts.reverse()) {
    let firstPart = selector.slice(0, part.index);
    let lastPart = selector.slice(part.index + part.length, selector.length);
    selector = `${firstPart}<span class="${cssClassForSpecificityType(part.type)}">${part.selector}</span>${lastPart}`;
  }
  return selector;
}

function cssClassForSpecificityType(type) {
  if(type == 'i') return 'inline';
  if(type == 'a') return 'ids';
  if(type == 'b') return 'classes';
  if(type == 'c') return 'elements';
}
