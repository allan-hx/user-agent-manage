chrome.runtime.onInstalled.addListener(updateDynamicRules);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'update-dynamic-rules':
      updateDynamicRules();
      break;
  }

  return true;
});

async function updateDynamicRules() {
  const data = await chrome.storage.local.get();
  const addRules = Object.keys(data)
    .filter((key) => key in data)
    .map((key, index) => {
      return {
        id: index + 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'User-Agent',
              operation: 'set',
              value: data[key],
            },
          ],
        },
        condition: {
          urlFilter: key,
          resourceTypes: [
            'main_frame',
            'sub_frame',
            'xmlhttprequest',
            'stylesheet',
            'script',
            'image',
            'font',
            'object',
            'media',
            'websocket',
          ],
        },
      };
    });

  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules,
      removeRuleIds: rules.map((item) => item.id),
    });
  });
}
