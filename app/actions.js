const ActionId = {
  OEPN_URL_NEW_TAB: 1,
  OPEN_URL_CURRENT_TAB: 2,
  JUMP_URL: 3,
  EXECUTE_SCRIPT: 4
};

const Actions = [
  {id: ActionId.JUMP_URL, name: 'Jump to url'},
  {id: ActionId.OEPN_URL_NEW_TAB, name: 'Open url in new tab'},
  {id: ActionId.OPEN_URL_CURRENT_TAB, name: 'Open url in current tab'},
  {id: ActionId.EXECUTE_SCRIPT, name: 'Execute script'}
];

class Action {
  static fromId(actionId) {
    return Actions.find((action) => action.id == actionId);
  }
}
