// Responsible only for dealing with the context-menu entry and sending requests to the injected script.
(function () {
    "use strict";

    function send_signal(tab_id, signal_name) {
        if( tab_id === -1 ) {
            chrome.tabs.query({
                "active": true,
                "currentWindow": true
            }, function (tabs) {
                tab_id = tabs[0].id;
    
                chrome.tabs.sendMessage(tab_id, {
                    "function": signal_name
                });
            });
        }
        else {
            chrome.tabs.sendMessage(tab_id, {
                "function": signal_name
            });
        }
    }

    chrome.contextMenus.create({"title": "Link Collector", "contexts": ["all"], 
        "onclick": function (info, tab) {
            send_signal( tab.id, "context_menu_clicked" );
        }
    });

    chrome.commands.onCommand.addListener(function (command) {
        send_signal(-1, command);
    });
})();
