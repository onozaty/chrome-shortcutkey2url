# ShortcutKey2URL for Chrome

ShortcutKey2URL for Chrome is an extension for Google Chrome that allows you to open, and move url using shortcut keys. You can also run JavaScript.

Display the action list with the startup key and execute the action with the next key.  
The startup key default is Ctrl+Period(on mac, Command+Comma). You can change this key later. 

Characters that can be used as keys are not limited to one character. It can be set as multiple characters. ShrotcutKey2URL executes its action from the characters entered consecutively as keys when the target is narrowed down to one.

The items that can be set as actions are as follows.

* Jump to URL. For already opened URL, go to that tab. Open it as a new tab if it is not already open.
* Open URL in new tab.
* Open URL in current tab.
* Execute the JavaScript on the current tab.
* Open URL as a new tab and then execute the JavaScript.

## Installation

Install from the following.

* [ShortcutKey2URL for Chrome - Chrome Web Store](https://chrome.google.com/webstore/detail/shortcutkey2url-for-chrom/hfohmffbfcobmhfgpkbcjjaijmfplcdg "ShortcutKey2URL for Chrome - Chrome Web Store")

## Setting the startup key

You can change the startup key from Keybord shortcuts in Menu > More tools > Extensions.

![Screenshot of change startupkey](screenshots/change_startupkey.png)

## Usage

When you press the startup key, a list of shortcuts is displayed in the popup.

![Screenshot of popup](screenshots/popup.png)

When you enter a key, the corresponding shortcut will be executed.

![Screenshot of running](screenshots/run.gif)

## Shortcut settings

Set the shortcut key on the setting screen.

![Screenshot of option](screenshots/option.png)

### Settings

`Column count` specifies the number of columns of the shortcut to be displayed in the popup.  
The left is when `2` is specified, and the right is when `3` is specified.

![Screenshot of column 2](screenshots/column2.png) ![Screenshot of column 3](screenshots/column3.png)

If you check `Interactive filter of shortcut keys on the popup` of `Option`, you can interactively narrow down the shortcuts displayed in the popup.

![Screenshot of interactive filter](screenshots/interactive.gif)

### Shortcut Keys

Click to `Add current page`, you can easily set the current page as a shortcut key.

![Screenshot of add current page](screenshots/add_current_page.png)

It is also possible to add from the context menu.

![Screenshot of context menu](screenshots/context_menu.png)

![Screenshot of add current page setting](screenshots/add_current_page_setting.png)

Set a key to be assigned as a shortcut key in `Key`. It can be multiple characters.  
After pressing the startup key, press the key set here to execute the shortcut.

If you check `Hide in shortcut key list displayed in popup`, you can hide it in the shortcut list displayed in the popup.  
It is only hidden and is effective as a shortcut key.

Specify the action as a shortcut key with `Action`.  
The following can be specified.

* `Jump to url` Jump to URL. For already opened URL, go to that tab. Open it as a new tab if it is not already open.
* `Open url in new tab` Open URL in new tab.
* `Open url in current tab` Open URL in current tab.
* `Execute script` Execute the JavaScript on the current tab.

By entering `Script (optional)` you can execute arbitrary JavaScript after opening the URL.

### Import / Export

The list of shortcut keys can be exported / imported.  
This allows you to take backups and perform migrations. (E.g. migration between Firefox and Chrome)
