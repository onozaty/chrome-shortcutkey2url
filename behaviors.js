const BehaviorId = {
  OEPN_URL_NEW_TAB: 1,
  OPEN_URL_CURRENT_TAB: 2,
  JUMP_URL: 3,
  EXECUTE_SCRIPT: 4
};

const Behaviors = [
  {id: BehaviorId.JUMP_URL, name: 'Jump to url'},
  {id: BehaviorId.OEPN_URL_NEW_TAB, name: 'Open url in new tab'},
  {id: BehaviorId.OPEN_URL_CURRENT_TAB, name: 'Open url in current tab'},
  {id: BehaviorId.EXECUTE_SCRIPT, name: 'Execute script'}
];

class Behavior {
  static fromId(behaviorId) {
    return Behaviors.find((behavior) => behavior.id == behaviorId);
  }
}
