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
          sendResponse({
            startupCommand: settings._startupCommand,
            shortcutkeys: settings.all()
          });
        } else {
          // save
          settings.update(message.shortcutkeys).then(() => {
            sendResponse();
          })
        }
        return true;

      case 'background-options':

        chrome.tabs.getSelected(null, function(tab) {
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
                    content: tab.url
                  }
                },
                () => {});
              },
              100);
          });
        });
        return;
    }
  });
});