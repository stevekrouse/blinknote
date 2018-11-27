chrome.browserAction.onClicked.addListener(e => {
  const url = chrome.runtime.getURL('index.html');
  const queriedTab = chrome.tabs.query({'url': url}, tabList => {
    if (tabList.length > 0) {
      const tab = tabList[0];
      chrome.tabs.update(tab.id, {
        'active': true
      });
    } else {
      chrome.tabs.create({
        'url': url,
        'active': true
      });
    }
  });
});