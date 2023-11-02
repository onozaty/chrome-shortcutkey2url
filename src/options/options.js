// represents a single ShortcutKey
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

  // binds event handlers to the elements in the ShortcutList
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

  // fill the form with saved date
  _apply(data) {
    this.$inputKey.val(data.key);
    this.$inputHideOnPopup.prop('checked', data.hideOnPopup || false);
    this.$inputAction.val(data.action);
    this.$inputTitle.val(data.title);

    // only fill in the form if the action requires it
    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
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
        // The action id isn't valid.
        // Maybe a newer version of the extension has new actions.
        throw new RangeError('actionId is ' + data.action);
    }
  }

  // toggles the visibility of the detail section
  _toggleDetail() {
    if (this.$detail.is(':visible')) {
      this.closeDetail();
    } else {
      this.openDetail();
    }
  }

  // event handler for the "keydown" event of the key input
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

  // event handler for the "keypress" event of the key input
  // Uppercase input character
  _keypressInputKey(event) {
    if (event.charCode) {
      event.target.value += String.fromCharCode(event.charCode).toUpperCase();
      return false;
    }
  }

  // switch the visibility of the url/script input depending on the action
  _switchInputContent() {
    const action = parseInt(this.$inputAction.val(), 10);

    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
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

  // update the summary section
  _applySummary() {
    this.$summary.empty()
      .append($('<span>').addClass('key').text(this.$inputKey.val()))
      .append($('<span>').addClass('title').text(this.$inputTitle.val()));
  }

  // remove the shortcut key
  _remove() {
    this.$target.trigger('remove', this);
    this.$target.remove();
  }

  // validates if the input is not empty
  _validateNotEmpty($input) {
    if ($input.val() == '') {
      // Mark the input as invalid
      $input.parents('.form-group').addClass('has-error');
      return false;
    }

    return true;
  }

  // validates if the shortcut key is valid
  validate(others) {
    // remove all error marks
    this.$target.find('div.has-error').removeClass('has-error');
    // hide alert icon
    this.$alertIcon.hide();
    // hide duplicate message
    this.$duplicateMessage.hide().empty();

    // error marker
    var hasError = false;
    
    // Validate key
    // check if the key is empty
    if (!this._validateNotEmpty(this.$inputKey)) {
      hasError = true;
    } else {
      // check if the key is duplicated
      const key = this.$inputKey.val();
      const duplicateKeys = others
        .filter((other) => {
          return (other.key != '')
            && (key.indexOf(other.key) == 0 || other.key.indexOf(key) == 0);
        })
        .map((other) => other.key)
        .join(', ');
      // show error key if the key is a duplicate
      if (duplicateKeys.length > 0) {
        this.$duplicateMessage
          .text('It duplicated with other shortcut keys(' + duplicateKeys + ').')
          .show();

        this.$inputKey.parents('.form-group').addClass('has-error');
        hasError = true;
      }
    }

    // validate action
    if (!this._validateNotEmpty(this.$inputAction)) {
      hasError = true;
    }

    // validate title
    if (!this._validateNotEmpty(this.$inputTitle)) {
      hasError = true;
    }

    // validate url/script depending on the action
    const action = parseInt(this.$inputAction.val(), 10);
    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
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

    // show alert icon if there is an error
    if (hasError) {
      this.$alertIcon.show();
    }
    return !hasError;
  }

  // show the detail section
  openDetail() {
    this.$detail.show();
    this.$openDetailButton.hide();
    this.$closeDetailButton.show();
  }

  // hide the detail section
  closeDetail() {
    this.$detail.hide();
    this.$openDetailButton.show();
    this.$closeDetailButton.hide();
  }

  // returns the data of the shortcut key
  data() {
    const data = {
      key: this.$inputKey.val(),
      hideOnPopup: this.$inputHideOnPopup.prop('checked') || false,
      action: parseInt(this.$inputAction.val(), 10),
      title: this.$inputTitle.val(),
    };

    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
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

// represents the list of all shortcut keys on the option page
class ShortcutKeys {
  constructor($target, $childTemplate) {
    this.$target = $target;
    this.$childTemplate = $childTemplate;
    this._shortcutKeys = [];
  }

  // event handler for the "remove" event of a ShortcutKey
  _removeShortcutKey(event, shortcutKey) {
    const index = this._shortcutKeys.indexOf(shortcutKey);
    if (index != -1) {
      this._shortcutKeys.splice(index, 1);
    }
  }

  // add a new ShortcutKey to the list
  append(data, isOpened) {
    const $child = this.$childTemplate.clone(true);
    const shortcutKey = new ShortcutKey($child, data);

    $child.on('remove', this._removeShortcutKey.bind(this));

    isOpened ? shortcutKey.openDetail() : shortcutKey.closeDetail();

    this._shortcutKeys.push(shortcutKey);
    this.$target.append($child.show());

    $child[0].scrollIntoView();
  }

  // validates if all ShortcutKeys are valid
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

  // returns the data of all ShortcutKeys
  data() {
    return this._shortcutKeys.map((shortcutKey) => shortcutKey.data());
  }
}

// event handler for the startup of the option page
function startup(settings) {
  // fill the startup key with the save value in the settings
  $('#startupKey').val(settings.startupCommand.shortcut);

  // fill the list column count with the save value in the settings
  const $inputColumnCount = $('#inputColumnCount');
  $inputColumnCount.val(settings.listColumnCount);

  // fill the filter on popup with the save value in the settings
  const $inputFilterOnPopup = $('#inputFilterOnPopup');
  $inputFilterOnPopup.prop('checked', settings.filterOnPopup || false);

  // load the form template
  const $formTemplate = $('#template');

  // fill the action select with the actions
  const $actionTemplate = $formTemplate.find('select[name="action"]');
  // clear the action select
  $actionTemplate.empty();
  // load all available actions
  Actions.forEach((action) => {
    // create a new option element for ever action
    $option = $('<option>').val(action.id).text(action.name);
    // add the option to the action select
    $actionTemplate.append($option);
  });

  // create the ShortcutKeys list
  const shortcutKeys = new ShortcutKeys($('#shortcutKeys'), $formTemplate);
  // add all saved shortcut keys to the list
  settings.shortcutKeys
    .forEach((shortcutKey) => {
      shortcutKeys.append(shortcutKey);
    });

  // add a new shortcut key to the list
  $('#addButton').on('click', () => {
    shortcutKeys.append(null, true);
  });

  // create event handler for the import button
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

  // create event handler for the export button
  $('#exportButton').on('click', () => {
    const downloadLink = document.createElement('a');
    downloadLink.download = 'shortcutkeys.json';
    downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(shortcutKeys.data(), null, 2)], { 'type': 'text/plain' }));
    downloadLink.setAttribute('hidden', true);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  });

  // create event handler for the save button
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

  // create event handler for the keyboard shortcuts menu button
  $('#shortcutsButton').on('click', () => {
    chrome.runtime.sendMessage({ target: 'background-shortcuts', name: 'open' });
    return false;
  });

  // create event handler for the error and success messages
  $("#errorMessage, #successMessage").find('.close')
    .on('click', (event) => {
      $(event.target).parent().hide();
    });

  // Add listener for the message from background.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    if (message.target == 'options') {
      shortcutKeys.append(message.data, true);
    }
  });
}

// call the startup function when the page is loaded
$(() => {
  chrome.runtime.sendMessage({ target: 'background-settings', name: 'load' }, startup);
});
