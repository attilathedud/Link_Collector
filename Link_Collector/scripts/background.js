// Responsible only for dealing with the context-menu entry and sending requests to the injected script.
(function () {
    "use strict";

    var options = {
        'activated' : true
    };

    chrome.storage.local.get( options, function ( items ) {
        for( var key in items ) {
            options[ key ] = items[ key ];
        }

        chrome.contextMenus.create({"title": "Link Collector", "contexts": ["all"], 
            "onclick": function (info, tab) {
                chrome.tabs.sendMessage(tab.id, {
                    "function": "context_menu_clicked"
                });
            }
        });
    
        chrome.commands.onCommand.addListener(function (command) {
            if( options['activated'] ) {
                chrome.tabs.query({
                    "active": true,
                    "currentWindow": true
                }, function (tabs) {
                    var tab_id = tabs[0].id;
        
                    chrome.tabs.sendMessage(tab_id, {
                        "function": command
                    });
                });
            }
        });
    });

    chrome.storage.onChanged.addListener( function( changes, namespace ) {
        for (var key in changes) {
            var storageChange = changes[key];
    
            options[ key ] = storageChange.newValue;
        }
    });
})();
