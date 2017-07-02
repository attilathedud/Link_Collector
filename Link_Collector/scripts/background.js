( function() {
    "use strict";

    function contextMenu_onclick( info, tab ) {
        var tab_id = 0;

        chrome.tabs.query({
            "active"        : true,
            "currentWindow" : true
        }, function (tabs) {
            tab_id = tabs[ 0 ].id;

            chrome.tabs.sendMessage( tab_id, {
                "function" : "context_menu_clicked"
            });
        });
    };

    chrome.contextMenus.create({
        "title"     : "Link Collector",
        "contexts"  : [ "all" ],
        "onclick"   : contextMenu_onclick
    });
})();
