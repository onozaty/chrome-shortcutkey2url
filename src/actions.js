const ActionId = {
  OEPN_URL_NEW_TAB: 1,
  OPEN_URL_CURRENT_TAB: 2,
  JUMP_URL: 3,
  EXECUTE_SCRIPT: 4,
  OPEN_URL_PRIVATE_MODE: 5,
  OPEN_CURRENT_TAB_PRIVATE_MODE: 6,
  JUMP_URL_ALL_WINDOWS: 7
};

const Actions = [
  { id: ActionId.JUMP_URL, name: 'Jump to url' },
  { id: ActionId.JUMP_URL_ALL_WINDOWS, name: 'Jump to url (Including other windows)' },
  { id: ActionId.OEPN_URL_NEW_TAB, name: 'Open url in new tab' },
  { id: ActionId.OPEN_URL_CURRENT_TAB, name: 'Open url in current tab' },
  { id: ActionId.EXECUTE_SCRIPT, name: 'Execute script' },
  { id: ActionId.OPEN_URL_PRIVATE_MODE, name: 'Open url in incognito window' },
  { id: ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE, name: 'Open current tab in incognito window' }
];

class Action {
  static fromId(actionId) {
    return Actions.find((action) => action.id == actionId);
  }
}
