'use babel';
import cssSpecificityStatus from './css-specificity-status.js';

import cssSpecificityDetail from './css-specificity-detail.js';

var commands;

export function activate() {
  commands = atom.commands.add('atom-text-editor[data-grammar="source css"]', {
    ['css-specificity:show-detail']() {
      showDetailView();
    },
  });
}

export function deactivate() {
  commands.dispose();

  if(statusTile) {
    statusView.destroy();
    statusTile.destroy();
  }

  if(detailView) {
    detailView.destroy();
  }

  [statusTile, statusView, detailView] = [];
}

var statusTile;
var statusView;

export function consumeStatusBar(statusBar) {
  statusView = cssSpecificityStatus();
  statusTile = statusBar.addLeftTile({
    item: statusView,
  });
}

var detailView;

export function showDetailView() {
  if(!statusView.currentSelector) return;

  if(!detailView) detailView = cssSpecificityDetail();
  detailView.show();
  detailView.update(statusView.currentSelector);
}
