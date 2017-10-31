class ShortcutKey {
  constructor($target, data) {
    this.$target = $target;
    this.$summary = $target.find('div.panel-heading a.summary');
    this.$detail = $target.find('div.panel-body');

    this.$alertIcon = $target.find('.alert-icon');
    this.$duplicateMessage = $target.find('.duplicate-message');

    this.$openDetailButton = $target.find('button.open-detail');
    this.$closeDetailButton = $target.find('button.close-detail');
    this.$removeButton = $target.find('button.remove');

    this.$inputKey = $target.find('input[name="key"]');
    this.$inputAction = $target.find('select[name="action"]');
    this.$inputTitle = $target.find('input[name="title"]');
    this.$inputUrl = $target.find('input[name="url"]');
    this.$inputScript = $target.find('textarea[name="script"]');

    this.$inputUrlGroup = this.$inputUrl.parents('div.form-group');
    this.$labelScriptOptional = this.$inputScript.parents('div.form-group').find('label span.optional');

    this._registerEvents();

    if (data) {
      this._apply(data);
    }

    this._switchInputContent();
    this._applySummary();
  }

  _registerEvents() {
    this.$summary.on('click', this._toggleDetail.bind(this));
    this.$openDetailButton.on('click', this.openDetail.bind(this));
    this.$closeDetailButton.on('click', this.closeDetail.bind(this));
    this.$removeButton.on('click', this._remove.bind(this));

    this.$inputAction.on('change', this._switchInputContent.bind(this));
    this.$inputKey.on('keyup', this._applySummary.bind(this));
    this.$inputTitle.on('keyup', this._applySummary.bind(this));

    this.$inputKey.on('keydown', this._keydownInputKey.bind(this));
    this.$inputKey.on('keypress', this._keypressInputKey.bind(this));
  }

  _apply(data) {

    this.$inputKey.val(data.key);
    this.$inputAction.val(data.action);
    this.$inputTitle.val(data.title);

    switch(data.action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.$inputUrl.val(data.url);
        this.$inputScript.val(data.script);
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.$inputScript.val(data.script);
        break;

      default:
        throw new RangeError('actionId is ' + data.action);
    }
  }

  _toggleDetail() {
    if (this.$detail.is(':visible')) {
      this.closeDetail();
    } else {
      this.openDetail();
    }
  }

  _keydownInputKey(event) {
    if (event.keyCode == 46) { // DOM_VK_DELETE
      event.target.value = '';
      return false;
    }

    if (event.keyCode == 8) { // DOM_VK_BACK_SPACE
      event.target.value = event.target.value.slice(0, -1);
      return false;
    }
  }

  _keypressInputKey(event) {
    if (event.charCode) {
      event.target.value += String.fromCharCode(event.charCode).toUpperCase();
      return false;
    }
  }

  _switchInputContent() {
    const action = parseInt(this.$inputAction.val(), 10);
  
    switch(action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.$inputUrlGroup.show();
        this.$labelScriptOptional.show();
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.$inputUrlGroup.hide();
        this.$labelScriptOptional.hide();
        break;

      default:
        throw new RangeError('actionId is ' + action);
    }
  }

  _applySummary() {
    this.$summary.empty()
      .append($('<span>').addClass('key').text(this.$inputKey.val()))
      .append($('<span>').addClass('title').text(this.$inputTitle.val()));
  }

  _remove() {
    this.$target.trigger('remove', this);
    this.$target.remove();
  }

  _validateEmpty($input) {
    if ($input.val() == '') {
      $input.parents('.form-group').addClass('has-error');
      return true;
    }

    return false;
  }

  validate(others) {
    this.$target.find('div.has-error').removeClass('has-error');
    this.$alertIcon.hide();
    this.$duplicateMessage.hide().empty();

    var hasError = false;
    if (this._validateEmpty(this.$inputKey)) {
      hasError = true;
    } else {
      // Duplicate
      const key = this.$inputKey.val();
      const duplicateKeys = others
        .filter((other) => {
          return (other.key != '')
                  && (key.indexOf(other.key) == 0 || other.key.indexOf(key) == 0);
        })
        .map((other) => other.key)
        .join(', ');

      if (duplicateKeys.length > 0) {
        this.$duplicateMessage
          .text('It duplicated with other shortcut keys(' + duplicateKeys + ').')
          .show();

        this.$inputKey.parents('.form-group').addClass('has-error');
        hasError = true;
      }
    }

    if (this._validateEmpty(this.$inputAction)) {
      hasError = true;
    }
    if (this._validateEmpty(this.$inputTitle)) {
      hasError = true;
    }

    const action = parseInt(this.$inputAction.val(), 10);
    switch(action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:

        if (this._validateEmpty(this.$inputUrl)) {
          hasError = true;
        }
        break;
  
      case ActionId.EXECUTE_SCRIPT:

        if (this._validateEmpty(this.$inputScript)) {
          hasError = true;
        }
        break;
  
      default:
        throw new RangeError('actionId is ' + action);
    }

    if (hasError) {
      this.$alertIcon.show();
    }
    return hasError;
  }

  openDetail() {
    this.$detail.show();
    this.$openDetailButton.hide();
    this.$closeDetailButton.show();
  }

  closeDetail() {
    this.$detail.hide();
    this.$openDetailButton.show();
    this.$closeDetailButton.hide();
  }

  data() {
    const data = {
      key: this.$inputKey.val(),
      action: parseInt(this.$inputAction.val(), 10),
      title: this.$inputTitle.val(),
    };

    switch(data.action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        data.url = this.$inputUrl.val();
        data.script = this.$inputScript.val();
        break;

      case ActionId.EXECUTE_SCRIPT:
        data.script = this.$inputScript.val();
        break;

      default:
        throw new RangeError('actionId is ' + data.action);
    }

    return data;
  }
}

class ShortcutKeys {
  constructor($target, $childTemplate) {
    this.$target = $target;
    this.$childTemplate = $childTemplate;
    this._shortcutKeys = [];
  }

  _removeShortcutKey(event, shortcutKey) {
    const index = this._shortcutKeys.indexOf(shortcutKey);
    if (index != -1) {
      this._shortcutKeys.splice(index, 1);
    }
  }

  append(data, isOpened) {
    const $child = this.$childTemplate.clone(true);
    const shortcutKey = new ShortcutKey($child, data);

    $child.on('remove', this._removeShortcutKey.bind(this));

    isOpened ? shortcutKey.openDetail() : shortcutKey.closeDetail();

    this._shortcutKeys.push(shortcutKey);
    this.$target.append($child.show());

    $child[0].scrollIntoView();
  }

  validate() {

    const shortcutKeyAndData = this._shortcutKeys.map((shortcutKey) => {
      return {
        shortcutKey: shortcutKey,
        data: shortcutKey.data()
      };
    });

    return this._shortcutKeys
      .filter((shortcutKey) => {
        shortcutKey.closeDetail();
        const others = shortcutKeyAndData
          .filter((x) => x.shortcutKey != shortcutKey)
          .map((x) => x.data);
        return shortcutKey.validate(others);
      })
      .length > 0;
  }

  data() {
    return this._shortcutKeys.map((shortcutKey) => shortcutKey.data());
  }
}

function startup(settings) {
  $('#startupKey').val(settings.startupCommand.shortcut);

  const $inputColumnCount = $('#inputColumnCount');
  $inputColumnCount.val(settings.listColumnCount);

  const $formTemplate = $('#template');

  const $actionTemplate = $formTemplate.find('select[name="action"]');
  $actionTemplate.empty();
  Actions.forEach((action) => {
    $option = $('<option>').val(action.id).text(action.name);
    $actionTemplate.append($option);
  });

  const shortcutKeys = new ShortcutKeys($('#shortcutKeys'), $formTemplate);
  settings.shortcutKeys
    .forEach((shortcutKey) => {
      shortcutKeys.append(shortcutKey);
    });
  
  $('#addButton').on('click', () => {
    shortcutKeys.append(null, true);
  });

  $('#saveButton').on('click', () => {
    $("#successMessage").hide();
    $("#errorMessage").hide();

    if (!shortcutKeys.validate()) {
      const request = {
        target: 'background-settings',
        name: 'save',
        settings: {
          shortcutKeys: shortcutKeys.data(),
          listColumnCount: parseInt($inputColumnCount.val(), 10)
        }
      };
      chrome.runtime.sendMessage(request, () => {
        $("#successMessage").show();
      });
    } else {
      $("#errorMessage").show();
    }
  });

  $("#errorMessage, #successMessage").find('.close')
    .on('click', (event) => {
      $(event.target).parent().hide();
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    if (message.target == 'options') {
      shortcutKeys.append(message.data, true);
    }
  });
}

$(() => {
  chrome.runtime.sendMessage({target: 'background-settings', name: 'load'}, startup);
});
