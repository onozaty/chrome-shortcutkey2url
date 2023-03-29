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
    this.$inputHideOnPopup = $target.find('input[name="hideOnPopup"]');
    this.$inputAction = $target.find('select[name="action"]');
    this.$inputTitle = $target.find('input[name="title"]');
    this.$inputUrl = $target.find('input[name="url"]');
    this.$inputScript = $target.find('textarea[name="script"]');

    this.$inputUrlGroup = this.$inputUrl.parents('div.form-group');
    this.$inputScriptGroup = this.$inputScript.parents('div.form-group');
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
    this.$inputHideOnPopup.prop('checked', data.hideOnPopup || false);
    this.$inputAction.val(data.action);
    this.$inputTitle.val(data.title);

    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.$inputUrl.val(data.url);
        this.$inputScript.val(data.script);
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.$inputScript.val(data.script);
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        this.$inputUrl.val(data.url);
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
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

    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.$inputUrlGroup.show();
        this.$inputScriptGroup.show();
        this.$labelScriptOptional.show();
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.$inputUrlGroup.hide();
        this.$inputScriptGroup.show();
        this.$labelScriptOptional.hide();
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        this.$inputUrlGroup.show();
        this.$inputScriptGroup.hide();
        this.$labelScriptOptional.hide();
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        this.$inputUrlGroup.hide();
        this.$inputScriptGroup.hide();
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

  _validateNotEmpty($input) {
    if ($input.val() == '') {
      $input.parents('.form-group').addClass('has-error');
      return false;
    }

    return true;
  }

  validate(others) {
    this.$target.find('div.has-error').removeClass('has-error');
    this.$alertIcon.hide();
    this.$duplicateMessage.hide().empty();

    var hasError = false;
    if (!this._validateNotEmpty(this.$inputKey)) {
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

    if (!this._validateNotEmpty(this.$inputAction)) {
      hasError = true;
    }
    if (!this._validateNotEmpty(this.$inputTitle)) {
      hasError = true;
    }

    const action = parseInt(this.$inputAction.val(), 10);
    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:

        if (!this._validateNotEmpty(this.$inputUrl)) {
          hasError = true;
        }
        break;

      case ActionId.EXECUTE_SCRIPT:

        if (!this._validateNotEmpty(this.$inputScript)) {
          hasError = true;
        }
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:

        if (!this._validateNotEmpty(this.$inputUrl)) {
          hasError = true;
        }
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        break;

      default:
        throw new RangeError('actionId is ' + action);
    }

    if (hasError) {
      this.$alertIcon.show();
    }
    return !hasError;
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
      hideOnPopup: this.$inputHideOnPopup.prop('checked') || false,
      action: parseInt(this.$inputAction.val(), 10),
      title: this.$inputTitle.val(),
    };

    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        data.url = this.$inputUrl.val();
        data.script = this.$inputScript.val();
        break;

      case ActionId.EXECUTE_SCRIPT:
        data.script = this.$inputScript.val();
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        data.url = this.$inputUrl.val();
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
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
        return !shortcutKey.validate(others);
      })
      .length == 0;
  }

  data() {
    return this._shortcutKeys.map((shortcutKey) => shortcutKey.data());
  }
}

function startup(settings) {
  $('#startupKey').val(settings.startupCommand.shortcut);

  const $inputColumnCount = $('#inputColumnCount');
  $inputColumnCount.val(settings.listColumnCount);

  const $inputFilterOnPopup = $('#inputFilterOnPopup');
  $inputFilterOnPopup.prop('checked', settings.filterOnPopup || false);

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

  $('#importButton').on('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.setAttribute('hidden', true);

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContents = e.target.result;

        try {
          const importShortcutKeys = JSON.parse(fileContents);
          importShortcutKeys.forEach((shortcutKey) => shortcutKeys.append(shortcutKey));
        } catch (error) {
          console.log(error);
          alert('Could not import due to invalid format.');
        }
      }
      reader.readAsText(file);
    }, false);

    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.remove();
  });

  $('#exportButton').on('click', () => {
    const downloadLink = document.createElement('a');
    downloadLink.download = 'shortcutkeys.json';
    downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(shortcutKeys.data(), null, 2)], { 'type': 'text/plain' }));
    downloadLink.setAttribute('hidden', true);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  });

  $('#saveButton').on('click', () => {
    $("#successMessage").hide();
    $("#errorMessage").hide();

    if (shortcutKeys.validate()) {
      const request = {
        target: 'background-settings',
        name: 'save',
        settings: {
          shortcutKeys: shortcutKeys.data(),
          listColumnCount: parseInt($inputColumnCount.val(), 10),
          filterOnPopup: $inputFilterOnPopup.prop('checked') || false
        }
      };
      chrome.runtime.sendMessage(request, () => {
        $("#successMessage").show();
      });
    } else {
      $("#errorMessage").show();
    }
  });

  $('#shortcutsButton').on('click', () => {
    chrome.runtime.sendMessage({ target: 'background-shortcuts', name: 'open' });
    return false;
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
  chrome.runtime.sendMessage({ target: 'background-settings', name: 'load' }, startup);
});
