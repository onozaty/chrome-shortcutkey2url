Settings.newAsync().then((settings) => {

  const handler = new Handler(settings);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);

    switch(message.target) {
      case 'background-handler':
        const result = handler.handle(message);

        console.log(result);
        sendResponse(result);
        return;

      case 'background-settings':
        if (message.name == 'load') {
          // load
          settings.reload().then(() => {
            sendResponse(settings.data());
          });
        } else {
          // save
          settings.update(message.settings).then(() => {
            sendResponse();
          });
        }
        return true;

      case 'background-options':
        // Message name is 'add' only
        addCurrentPage();
        return;
    }
  });

  const addCurrentPage = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tab = tabs[0];
      chrome.runtime.openOptionsPage(() => {
        // It takes time to open the option page
        setTimeout(() => {
          chrome.runtime.sendMessage(
            {
              target: 'options',
              name: 'add',
              data: {
                title: tab.title,
                action: ActionId.JUMP_URL,
                url: tab.url
              }
            });
          },
          500);
      });
    });
  }

  chrome.contextMenus.create({
    title: 'Add to ShortcutKey2URL',
    contexts: ['all'],
    type: 'normal',
    onclick: () => {
      addCurrentPage();
    }
  });
});