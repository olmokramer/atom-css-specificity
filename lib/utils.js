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
    selector = `${firstPart}${cssClassForSpecificityType(part.type, part.selector)}${lastPart}`;
  }
  return selector;
}

export function cssClassForSpecificityType(type, str) {
  var cssClass;
  if(type == 'i' || type == 'inline') cssClass = 'error';
  else if(type == 'a' || type == 'ids') cssClass = 'warning';
  else if(type == 'b' || type == 'classes') cssClass = 'success';
  else if(type == 'c' || type == 'elements') cssClass = 'info';
  return str != null ? `<span class="text-${cssClass}">${str}</span>` : cssClass;
}
