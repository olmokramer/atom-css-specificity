'use babel';
import {
  calculate as calculateSpecificity,
} from 'specificity';

import {
  CompositeDisposable,
} from 'atom';

import {
  addEventListener,
} from './utils.js';

var tagName = 'css-specificity-detail';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    // enable focus & blur events
    this.setAttribute('tabindex', -1);

    this.panel = atom.workspace.addModalPanel({
      item: this,
    });

    this.disposables = new CompositeDisposable(
      addEventListener(this, 'blur', () =>
        this.hide()
      ),
    );
  },

  destroy() {
    this.disposables.dispose();
  },

  show() {
    this.panel.show();
  },

  hide() {
    this.panel.hide();
  },

  update(selector) {
    this.innerHTML = '';
    for(let specificity of calculateSpecificity(selector)) {
      this.appendChild(this.specificityView(specificity));
    }
    this.focus();
  },

  specificityView(specificity) {
    var specificityView = document.createElement('div');
    specificityView.classList.add('specificity', 'inset-panel');

    specificityView.innerHTML = `
      <h1 class="panel-heading">
        ${this.specificityViewHeader(specificity)}
      </h1>
      <div class="panel-body padded">
        ${this.specificityViewbody(specificity.specificity)}
      </div>
    `;

    return specificityView;
  },

  specificityViewHeader({ selector, parts }) {
    for(let part of parts.reverse()) {
      let firstPart = selector.slice(0, part.index);
      let lastPart = selector.slice(part.index + part.length, selector.length);

      selector = `${firstPart}<span class="text-${this.classForSpecificityType(part.type)}">${part.selector}</span>${lastPart}`;
    }

    return selector;
  },

  specificityViewbody(specificity) {
    var [, inline, ids, classes, elements] = specificity.match(/(\d+),(\d+),(\d+),(\d+)/);
    return `
      <div class="inline-block padded highlight-${this.classForSpecificityType('i')}">
        <h1>${inline}</h1>
        <p>inline</p>
      </div>
      <div class="inline-block padded highlight-${this.classForSpecificityType('a')}">
        <h1>${ids}</h1>
        <p>ids</p>
      </div>
      <div class="inline-block padded highlight-${this.classForSpecificityType('b')}">
        <h1>${classes}</h1>
        <p>classes</p>
      </div>
      <div class="inline-block padded highlight-${this.classForSpecificityType('c')}">
        <h1>${elements}</h1>
        <p>elements</p>
      </div>
    `;
  },

  classForSpecificityType(type) {
    switch(type) {
      case 'i': return 'error';
      case 'a': return 'warning';
      case 'b': return 'success';
      case 'c': return 'info';
    }
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function cssSpecificityDetail() {
  return document.createElement(tagName);
}
