var devtoolsRegEx = /^chrome-devtools:\/\//;
var connections = {};

var messageToContentScript = function(message) {
    chrome.tabs.sendMessage(message.tabId, message);
};

chrome.runtime.onConnect.addListener(function(port) {
    var extensionListener = function(message, sender, sendResponse) {
        if (message.name == "init") {
            connections[message.tabId] = port;
            return;
        } else{
            messageToContentScript(message);
        }
    }

    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
        port.onMessage.removeListener(extensionListener);

        var tabs = Object.keys(connections);
        for (var i = 0, len = tabs.length; i < len; i++) {
            if (connections[tabs[i]] == port) {
                delete connections[tabs[i]]
                break;
            }
        }
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (sender.tab) {
        if (devtoolsRegEx.test(sender.tab.url)) {
            if(message.event==="shown" || message.event==="hidden"){
                var tabId = sender.tab.id;
                if (tabId in connections) {
                   connections[tabId].postMessage(message);
                } else {
                }
            }
            messageToContentScript(message);
        } else {
            var tabId = sender.tab.id;
            if (tabId in connections) {
                connections[tabId].postMessage(message);
            } else {
            }
        }
    } else {
    }
    return true;
});

