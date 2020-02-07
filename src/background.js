// chrome.extension calls
var connections = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//  console.log('incoming message from injected script');
 // console.log(request);

  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});


chrome.runtime.onConnect.addListener(function( connection ) {

 // console.log( 'onConnect', connection );

  // Listen to messages sent from the DevTools page
  var listener = function(message, sender, sendResponse) {
   
   // console.log('incoming message from dev tools page', message, sender, sendResponse );

    // Register initial connection  
    if ( message.name === 'tlrse_init') {
     // console.log( 'init' );
      connections[ message.tabId ] = connection;
    }
  }

  connection.onMessage.addListener( listener );

  connection.onDisconnect.addListener(function() {
    connection.onMessage.removeListener( listener );
  });


});