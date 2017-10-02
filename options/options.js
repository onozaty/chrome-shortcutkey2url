class Shortcutkey {
  constructor($target, data) {
    this.$target = $target;
    this.$summary = $target.find('div.panel-heading span.summary');
    this.$detail = $target.find('div.panel-body');

    this.$alertIcon = $target.find('.alert-icon');
    this.$duplicateMessage = $target.find('.duplicate-message');

    this.$openDetailButton = $target.find('button.open-detail');
    this.$closeDetailButton = $target.find('button.close-detail');
    this.$removeButton = $target.find('button.remove');

    this.$inputKey = $target.find('input[name="key"]');
    this.$inputBehavior = $target.find('select[name="behavior"]');
    this.$inputTitle = $target.find('input[name="title"]');
    this.$inputUrl = $target.find('input[name="url"]');
    this.$inputScript = $target.find('textarea[name="script"]');

    this.$inputUrlGroup = this.$inputUrl.parents('div[class="form-group"]');
    this.$inputScriptGroup = this.$inputScript.parents('div[class="form-group"]');

    this._registerEvents();

    if (data) {
      this._apply(data);
    }

    this._switchInputContent();
    this._applySummary();
  }

  _registerEvents() {
    this.$openDetailButton.on('click', this.openDetail.bind(this));
    this.$closeDetailButton.on('click', this.closeDetail.bind(this));
    this.$removeButton.on('click', this._remove.bind(this));

    this.$inputBehavior.on('change', this._switchInputContent.bind(this));
    this.$inputKey.on('keyup', this._applySummary.bind(this));
    this.$inputTitle.on('keyup', this._applySummary.bind(this));

    this.$inputKey.on('keypress', this._keypressInputKey.bind(this));
  }

  _apply(data) {

    this.$inputKey.val(data.key);
    this.$inputBehavior.val(data.behavior);
    this.$inputTitle.val(data.title);

    switch(data.behavior) {
      case BehaviorId.JUMP_URL:
      case BehaviorId.OEPN_URL_NEW_TAB:
      case BehaviorId.OPEN_URL_CURRENT_TAB:
        this.$inputUrl.val(data.content);
        break;

      case BehaviorId.EXECUTE_SCRIPT:
        this.$inputScript.val(data.content);
        break;

      default:
        throw new RangeError('behaviorId is ' + data.behavior);
    }
  }

  _keypressInputKey(event) {
    if (event.charCode) {
      event.target.value += String.fromCharCode(event.charCode).toUpperCase();
    }
    return false;
  }

  _switchInputContent() {
    const behavior = parseInt(this.$inputBehavior.val(), 10);
  
    switch(behavior) {
      case BehaviorId.JUMP_URL:
      case BehaviorId.OEPN_URL_NEW_TAB:
      case BehaviorId.OPEN_URL_CURRENT_TAB:
        this.$inputUrlGroup.show();
        this.$inputScriptGroup.hide();
        break;

      case BehaviorId.EXECUTE_SCRIPT:
        this.$inputUrlGroup.hide();
        this.$inputScriptGroup.show();
        break;

      default:
        throw new RangeError('behaviorId is ' + behavior);
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
    this.$duplicateMessage.empty();

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
          .text('It duplicated with other shortcutkeys(' + duplicateKeys + ').')
          .show();

        this.$inputKey.parents('.form-group').addClass('has-error');
        hasError = true;
      }
    }

    if (this._validateEmpty(this.$inputBehavior)) {
      hasError = true;
    }
    if (this._validateEmpty(this.$inputTitle)) {
      hasError = true;
    }

    const behavior = parseInt(this.$inputBehavior.val(), 10);
    var $inputContent = null;
    switch(behavior) {
      case BehaviorId.JUMP_URL:
      case BehaviorId.OEPN_URL_NEW_TAB:
      case BehaviorId.OPEN_URL_CURRENT_TAB:
        $inputContent = this.$inputUrl;
        break;
  
      case BehaviorId.EXECUTE_SCRIPT:
        $inputContent = this.$inputScript;
        break;
  
      default:
        throw new RangeError('behaviorId is ' + behavior);
    }

    if (this._validateEmpty($inputContent)) {
      hasError = true;
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
      behavior: parseInt(this.$inputBehavior.val(), 10),
      title: this.$inputTitle.val(),
    };

    switch(data.behavior) {
      case BehaviorId.JUMP_URL:
      case BehaviorId.OEPN_URL_NEW_TAB:
      case BehaviorId.OPEN_URL_CURRENT_TAB:
        data.content = this.$inputUrl.val();
        break;

      case BehaviorId.EXECUTE_SCRIPT:
        data.content = this.$inputScript.val();
        break;

      default:
        throw new RangeError('behaviorId is ' + data.behavior);
    }

    return data;
  }
}

class Shortcutkeys {
  constructor($target, $childTemplate) {
    this.$target = $target;
    this.$childTemplate = $childTemplate;
    this._shortcutkeys = [];
  }

  _removeShortcutkey(event, shortcutkey) {
    const index = this._shortcutkeys.indexOf(shortcutkey);
    if (index != -1) {
      this._shortcutkeys.splice(index, 1);
    }
  }

  append(data, isOpened) {
    const $child = this.$childTemplate.clone(true);
    const shortcutkey = new Shortcutkey($child, data);

    $child.on('remove', this._removeShortcutkey.bind(this));

    isOpened ? shortcutkey.openDetail() : shortcutkey.closeDetail();

    this._shortcutkeys.push(shortcutkey);
    this.$target.append($child.show());
  }

  validate() {

    const shortcutkeyAndData = this._shortcutkeys.map((shortcutkey) => {
      return {
        shortcutkey: shortcutkey,
        data: shortcutkey.data()
      };
    });

    return this._shortcutkeys
      .filter((shortcutkey) => {
        shortcutkey.closeDetail();
        const others = shortcutkeyAndData
          .filter((x) => x.shortcutkey != shortcutkey)
          .map((x) => x.data);
        return shortcutkey.validate(others);
      })
      .length > 0;
  }

  data() {
    return this._shortcutkeys.map((shortcutkey) => shortcutkey.data());
  }
}

function startup(settings) {
  const $formTemplate = $('#template');

  const $behaviorTemplate = $formTemplate.find('select[name="behavior"]');
  $behaviorTemplate.empty();
  Behaviors.forEach((behavior) => {
    $option = $('<option>').val(behavior.id).text(behavior.name);
    $behaviorTemplate.append($option);
  });

  const shortcutkeys = new Shortcutkeys($('#shortcutkeys'), $formTemplate);
  settings.all()
    .sort((o1, o2) => {
      if (o1.key < o2.key) return -1;
      if (o1.key > o2.key) return 1;
      return 0;
    })
    .forEach((shortcutkey) => {
      shortcutkeys.append(shortcutkey);
    });
  
  $('#addButton').on('click', () => {
    shortcutkeys.append(null, true);
  });

  $('#saveButton').on('click', () => {
    $("#successMessage").hide();
    $("#errorMessage").hide();

    if (!shortcutkeys.validate()) {
      settings.update(shortcutkeys.data()).then(() => {
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
}

$(() => {
  Settings.newAsync().then(startup);
});