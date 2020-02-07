// chrome.devtools calls

chrome.devtools.panels.create( "Three Live Raw Shader Editor",
    "icon_16.png",
    "panel.html",
    function(panel) {

      // code invoked on panel creation
    }
);

// Create a connection to the background page
var tlrsePageConnection = chrome.runtime.connect({
  name: 'panel'
});

tlrsePageConnection.postMessage({
  name: 'tlrse_init',
  tabId: chrome.devtools.inspectedWindow.tabId
});