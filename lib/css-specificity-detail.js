'use babel';
import {calculate as calculateSpecificity} from 'specificity';

import {CompositeDisposable} from 'atom';

import {addEventListener, highlightSelector} from './utils.js';

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

  specificityView({specificity, selector, parts}) {
    var specificityView = document.createElement('div');
    specificityView.classList.add('specificity', 'inset-panel');
    var [inline, ids, classes, elements] = specificity.split(',');

    specificityView.innerHTML = `
      <h1 class="panel-heading">
        ${highlightSelector(selector, parts)}
      </h1>
      <div class="panel-body padded">
        ${this.specificityTypeBlock(inline, 'inline')}
        ${this.specificityTypeBlock(ids, 'ids')}
        ${this.specificityTypeBlock(classes, 'classes')}
        ${this.specificityTypeBlock(elements, 'elements')}
      </div>
    `;

    return specificityView;
  },

  specificityTypeBlock(specificity, label) {
    return `
      <div class="inline-block padded ${label}">
        <h1>${specificity}</h1>
        <p>${label}</p>
      </div>
    `;
  },
});

document.registerElement(tagName, {
  prototype,
});

export default function cssSpecificityDetail() {
  return document.createElement(tagName);
}
