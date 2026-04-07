import { ActionId, Actions } from '../actions.js';

function sortShortcutKeys(shortcutKeys, sortMode) {
  const sorted = [...shortcutKeys];
  if (sortMode === 'key') {
    sorted.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  } else if (sortMode === 'title') {
    sorted.sort((a, b) => {
      const t1 = (a.title || '').toLowerCase();
      const t2 = (b.title || '').toLowerCase();
      return t1 < t2 ? -1 : t1 > t2 ? 1 : 0;
    });
  }
  return sorted;
}

export class ShortcutKey {
  constructor(target, data) {
    this.target = target;
    this.summary = target.querySelector('.summary');
    this.summaryText = target.querySelector('.summary-text');
    this.detail = target.querySelector('.entry-body');

    this.alertIcon = target.querySelector('.alert-icon');
    this.duplicateMessage = target.querySelector('.duplicate-message');

    this.openDetailButton = target.querySelector('button.open-detail');
    this.closeDetailButton = target.querySelector('button.close-detail');
    this.moveUpButton = target.querySelector('button.move-up');
    this.moveDownButton = target.querySelector('button.move-down');
    this.removeButton = target.querySelector('button.remove');

    this.inputKey = target.querySelector('input[name="key"]');
    this.inputHideOnPopup = target.querySelector('input[name="hideOnPopup"]');
    this.inputAction = target.querySelector('select[name="action"]');
    this.inputTitle = target.querySelector('input[name="title"]');
    this.inputUrl = target.querySelector('input[name="url"]');
    this.inputScript = target.querySelector('textarea[name="script"]');

    this.inputUrlGroup = target.querySelector('[data-field="url"]');
    this.inputScriptGroup = target.querySelector('[data-field="script"]');
    this.labelScriptOptional = target.querySelector('[data-field="script"] .optional');

    this._registerEvents();

    if (data) {
      this._apply(data);
    }

    this._switchInputContent();
    this._applySummary();
  }

  _registerEvents() {
    this.summary.addEventListener('click', this._toggleDetail.bind(this));
    this.openDetailButton.addEventListener('click', this.openDetail.bind(this));
    this.closeDetailButton.addEventListener('click', this.closeDetail.bind(this));
    this.moveUpButton.addEventListener('click', () => {
      this.target.dispatchEvent(new CustomEvent('entry-move-up', { detail: this, bubbles: true }));
    });
    this.moveDownButton.addEventListener('click', () => {
      this.target.dispatchEvent(new CustomEvent('entry-move-down', { detail: this, bubbles: true }));
    });
    this.removeButton.addEventListener('click', this._remove.bind(this));

    this.inputAction.addEventListener('change', this._switchInputContent.bind(this));
    this.inputKey.addEventListener('keyup', this._applySummary.bind(this));
    this.inputTitle.addEventListener('keyup', this._applySummary.bind(this));

    this.inputKey.addEventListener('keydown', this._keydownInputKey.bind(this));
    this.inputKey.addEventListener('keypress', this._keypressInputKey.bind(this));
  }

  _apply(data) {
    this.inputKey.value = data.key || '';
    this.inputHideOnPopup.checked = data.hideOnPopup || false;
    this.inputAction.value = data.action;
    this.inputTitle.value = data.title;

    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.inputUrl.value = data.url;
        this.inputScript.value = data.script || '';
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.inputScript.value = data.script;
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        this.inputUrl.value = data.url;
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        break;

      default:
        throw new RangeError('actionId is ' + data.action);
    }
  }

  _toggleDetail() {
    if (!this.detail.classList.contains('hidden')) {
      this.closeDetail();
    } else {
      this.openDetail();
    }
  }

  _keydownInputKey(event) {
    if (event.keyCode == 46) { // DOM_VK_DELETE
      event.preventDefault();
      event.target.value = '';
    }

    if (event.keyCode == 8) { // DOM_VK_BACK_SPACE
      event.preventDefault();
      event.target.value = event.target.value.slice(0, -1);
    }
  }

  _keypressInputKey(event) {
    if (event.charCode) {
      event.preventDefault();
      event.target.value += String.fromCharCode(event.charCode).toUpperCase();
    }
  }

  _switchInputContent() {
    const action = parseInt(this.inputAction.value, 10);

    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        this.inputUrlGroup.classList.remove('hidden');
        this.inputScriptGroup.classList.remove('hidden');
        this.labelScriptOptional.classList.remove('hidden');
        break;

      case ActionId.EXECUTE_SCRIPT:
        this.inputUrlGroup.classList.add('hidden');
        this.inputScriptGroup.classList.remove('hidden');
        this.labelScriptOptional.classList.add('hidden');
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        this.inputUrlGroup.classList.remove('hidden');
        this.inputScriptGroup.classList.add('hidden');
        this.labelScriptOptional.classList.add('hidden');
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        this.inputUrlGroup.classList.add('hidden');
        this.inputScriptGroup.classList.add('hidden');
        this.labelScriptOptional.classList.add('hidden');
        break;

      default:
        throw new RangeError('actionId is ' + action);
    }
  }

  _applySummary() {
    this.summaryText.textContent = '';
    const keySpan = document.createElement('span');
    keySpan.className = 'key';
    keySpan.textContent = this.inputKey.value;
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = this.inputTitle.value;
    this.summaryText.appendChild(keySpan);
    this.summaryText.appendChild(titleSpan);
  }

  _remove() {
    this.target.dispatchEvent(new CustomEvent('entry-remove', { detail: this, bubbles: true }));
    this.target.remove();
  }

  _validateNotEmpty(input) {
    if (input.value === '') {
      input.closest('.form-row').classList.add('has-error');
      return false;
    }
    return true;
  }

  validate(others) {
    this.target.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    this.alertIcon.classList.add('hidden');
    this.duplicateMessage.classList.add('hidden');
    this.duplicateMessage.textContent = '';

    let hasError = false;
    if (!this._validateNotEmpty(this.inputKey)) {
      hasError = true;
    } else {
      const key = this.inputKey.value;
      const duplicateKeys = others
        .filter((other) => {
          return (other.key !== '')
            && (key.indexOf(other.key) === 0 || other.key.indexOf(key) === 0);
        })
        .map((other) => other.key)
        .join(', ');

      if (duplicateKeys.length > 0) {
        this.duplicateMessage.textContent = 'It duplicated with other shortcut keys(' + duplicateKeys + ').';
        this.duplicateMessage.classList.remove('hidden');
        this.inputKey.closest('.form-row').classList.add('has-error');
        hasError = true;
      }
    }

    if (!this._validateNotEmpty(this.inputAction)) {
      hasError = true;
    }
    if (!this._validateNotEmpty(this.inputTitle)) {
      hasError = true;
    }

    const action = parseInt(this.inputAction.value, 10);
    switch (action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        if (!this._validateNotEmpty(this.inputUrl)) {
          hasError = true;
        }
        break;

      case ActionId.EXECUTE_SCRIPT:
        if (!this._validateNotEmpty(this.inputScript)) {
          hasError = true;
        }
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        if (!this._validateNotEmpty(this.inputUrl)) {
          hasError = true;
        }
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        break;

      default:
        throw new RangeError('actionId is ' + action);
    }

    if (hasError) {
      this.alertIcon.classList.remove('hidden');
    }
    return !hasError;
  }

  openDetail() {
    this.detail.classList.remove('hidden');
    this.openDetailButton.classList.add('hidden');
    this.closeDetailButton.classList.remove('hidden');
  }

  closeDetail() {
    this.detail.classList.add('hidden');
    this.openDetailButton.classList.remove('hidden');
    this.closeDetailButton.classList.add('hidden');
  }

  setMovable(visible) {
    this.moveUpButton.classList.toggle('hidden', !visible);
    this.moveDownButton.classList.toggle('hidden', !visible);
  }

  data() {
    const data = {
      key: this.inputKey.value,
      hideOnPopup: this.inputHideOnPopup.checked || false,
      action: parseInt(this.inputAction.value, 10),
      title: this.inputTitle.value,
    };

    switch (data.action) {
      case ActionId.JUMP_URL:
      case ActionId.JUMP_URL_ALL_WINDOWS:
      case ActionId.OEPN_URL_NEW_TAB:
      case ActionId.OPEN_URL_CURRENT_TAB:
        data.url = this.inputUrl.value;
        data.script = this.inputScript.value;
        break;

      case ActionId.EXECUTE_SCRIPT:
        data.script = this.inputScript.value;
        break;

      case ActionId.OPEN_URL_PRIVATE_MODE:
        data.url = this.inputUrl.value;
        break;

      case ActionId.OPEN_CURRENT_TAB_PRIVATE_MODE:
        break;

      default:
        throw new RangeError('actionId is ' + data.action);
    }

    return data;
  }
}

export class ShortcutKeys {
  constructor(target, entryTemplate) {
    this.target = target;
    this.entryTemplate = entryTemplate;
    this._shortcutKeys = [];

    this.target.addEventListener('entry-remove', (event) => {
      const index = this._shortcutKeys.indexOf(event.detail);
      if (index !== -1) {
        this._shortcutKeys.splice(index, 1);
      }
    });

    this.target.addEventListener('entry-move-up', (event) => {
      const index = this._shortcutKeys.indexOf(event.detail);
      if (index > 0) {
        [this._shortcutKeys[index - 1], this._shortcutKeys[index]] =
          [this._shortcutKeys[index], this._shortcutKeys[index - 1]];
        const prev = event.detail.target.previousElementSibling;
        if (prev) {
          this.target.insertBefore(event.detail.target, prev);
        }
      }
    });

    this.target.addEventListener('entry-move-down', (event) => {
      const index = this._shortcutKeys.indexOf(event.detail);
      if (index < this._shortcutKeys.length - 1) {
        [this._shortcutKeys[index], this._shortcutKeys[index + 1]] =
          [this._shortcutKeys[index + 1], this._shortcutKeys[index]];
        const next = event.detail.target.nextElementSibling;
        if (next) {
          this.target.insertBefore(next, event.detail.target);
        }
      }
    });
  }

  setCustomMode(isCustom) {
    this._shortcutKeys.forEach((sk) => sk.setMovable(isCustom));
  }

  reorder(sortMode) {
    if (sortMode === 'custom') return;
    const sorted = [...this._shortcutKeys].sort((a, b) => {
      const da = a.data();
      const db = b.data();
      if (sortMode === 'title') {
        const t1 = (da.title || '').toLowerCase();
        const t2 = (db.title || '').toLowerCase();
        return t1 < t2 ? -1 : t1 > t2 ? 1 : 0;
      }
      return da.key < db.key ? -1 : da.key > db.key ? 1 : 0;
    });
    sorted.forEach((sk) => this.target.appendChild(sk.target));
    this._shortcutKeys = sorted;
  }

  append(data, isOpened) {
    const child = this.entryTemplate.content.cloneNode(true).firstElementChild;
    const shortcutKey = new ShortcutKey(child, data);

    isOpened ? shortcutKey.openDetail() : shortcutKey.closeDetail();

    this._shortcutKeys.push(shortcutKey);
    this.target.appendChild(child);

    if (isOpened) child.scrollIntoView();
  }

  validate() {
    const shortcutKeyAndData = this._shortcutKeys.map((shortcutKey) => ({
      shortcutKey,
      data: shortcutKey.data()
    }));

    return this._shortcutKeys
      .filter((shortcutKey) => {
        shortcutKey.closeDetail();
        const others = shortcutKeyAndData
          .filter((x) => x.shortcutKey !== shortcutKey)
          .map((x) => x.data);
        return !shortcutKey.validate(others);
      })
      .length === 0;
  }

  data() {
    return this._shortcutKeys.map((shortcutKey) => shortcutKey.data());
  }
}

export function startup(settings) {
  document.getElementById('startupKey').value = settings.startupCommand.shortcut;

  const inputColumnCount = document.getElementById('inputColumnCount');
  inputColumnCount.value = settings.listColumnCount;

  const inputSortMode = document.getElementById('inputSortMode');
  inputSortMode.value = settings.listSortMode || 'key';

  const inputFilterOnPopup = document.getElementById('inputFilterOnPopup');
  inputFilterOnPopup.checked = settings.filterOnPopup || false;

  const inputDisabledSync = document.getElementById('inputDisabledSync');
  inputDisabledSync.checked = !settings.synced;

  const entryTemplate = document.getElementById('entry-template');
  const actionSelect = entryTemplate.content.querySelector('select[name="action"]');
  Actions.forEach((action) => {
    const option = document.createElement('option');
    option.value = action.id;
    option.textContent = action.name;
    actionSelect.appendChild(option);
  });

  const shortcutKeys = new ShortcutKeys(document.getElementById('shortcutKeys'), entryTemplate);
  settings.shortcutKeys.forEach((shortcutKey) => {
    shortcutKeys.append(shortcutKey);
  });

  shortcutKeys.setCustomMode(inputSortMode.value === 'custom');

  inputSortMode.addEventListener('change', () => {
    shortcutKeys.reorder(inputSortMode.value);
    shortcutKeys.setCustomMode(inputSortMode.value === 'custom');
  });

  const checkUserScriptsDisabled = (shortcutKeyDataList) => {
    if (typeof chrome.userScripts === 'undefined') {
      const hasScript = shortcutKeyDataList.some((shortcutKey) => shortcutKey.script && shortcutKey.script.trim() !== '');
      document.getElementById('userScriptsDisabledMessage').classList.toggle('hidden', !hasScript);
    }
  };

  checkUserScriptsDisabled(settings.shortcutKeys);

  chrome.action.getUserSettings().then((userSettings) => {
    if (!userSettings.isOnToolbar) {
      document.getElementById('notPinnedMessage').classList.remove('hidden');
    }
  });

  document.getElementById('addButton').addEventListener('click', () => {
    shortcutKeys.append(null, true);
    shortcutKeys.setCustomMode(inputSortMode.value === 'custom');
  });

  document.getElementById('importButton').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.setAttribute('hidden', true);

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importShortcutKeys = JSON.parse(e.target.result);
          importShortcutKeys.forEach((shortcutKey) => shortcutKeys.append(shortcutKey));
        } catch (error) {
          console.log(error);
          alert('Could not import due to invalid format.');
        }
      };
      reader.readAsText(file);
    }, false);

    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.remove();
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    const downloadLink = document.createElement('a');
    downloadLink.download = 'shortcutkeys.json';
    downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(shortcutKeys.data(), null, 2)], { type: 'text/plain' }));
    downloadLink.setAttribute('hidden', true);

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  });

  document.getElementById('saveButton').addEventListener('click', () => {
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');

    if (shortcutKeys.validate()) {
      const request = {
        target: 'background-settings',
        name: 'save',
        settings: {
          shortcutKeys: sortShortcutKeys(shortcutKeys.data(), inputSortMode.value),
          listColumnCount: parseInt(inputColumnCount.value, 10),
          filterOnPopup: inputFilterOnPopup.checked || false,
          listSortMode: inputSortMode.value,
          synced: !inputDisabledSync.checked
        }
      };
      chrome.runtime.sendMessage(request, (settings) => {
        shortcutKeys.reorder(inputSortMode.value);
        document.getElementById('successMessage').classList.remove('hidden');
        checkUserScriptsDisabled(request.settings.shortcutKeys);
        window.scrollTo(0, 0);

        if (request.settings.synced && !settings.synced) {
          alert('Synchronization was disabled because it could not be saved to sync storage.\nIf there are too many shortcut keys, saving to sync storage will fail.');
          document.getElementById('inputDisabledSync').checked = true;
        }
      });
    } else {
      document.getElementById('errorMessage').classList.remove('hidden');
      window.scrollTo(0, 0);
    }
  });

  document.getElementById('extensionSettingsLink').addEventListener('click', () => {
    chrome.runtime.sendMessage({ target: 'background-extension-settings', name: 'open' });
    return false;
  });

  /* Chrome only */
  document.getElementById('shortcutsButton').addEventListener('click', () => {
    chrome.runtime.sendMessage({ target: 'background-shortcuts', name: 'open' });
    return false;
  });
  /*-------------*/

  document.querySelectorAll('#errorMessage .close, #successMessage .close').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.target.closest('.alert').classList.add('hidden');
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
    if (message.target === 'options') {
      shortcutKeys.append(message.data, true);
    }
  });
}

chrome.runtime.sendMessage({ target: 'background-settings', name: 'load' }, startup);
