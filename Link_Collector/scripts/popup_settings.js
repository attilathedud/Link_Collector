(function () {
    "use strict";

    var options = {
        'activated' : true
    };

    function toggle_activate_button(active) {
        if( active ) {
            document.getElementById('activate').className = "button-secondary";
            document.getElementById('activate').innerText = "Deactivate";
        }
        else {
            document.getElementById('activate').className = "button-primary";
            document.getElementById('activate').innerText = "Activate";
        }
    }

    chrome.storage.local.get( options, function ( items ) {
        for( var key in items ) {
            options[ key ] = items[ key ];
        }

        toggle_activate_button( options['activated'] );

        document.getElementById('activate').onclick = function() {
            options['activated'] = !options['activated'];
            toggle_activate_button(options['activated']);
            chrome.storage.local.set({activated : options['activated']});
        }

        // By default, popup settings in Chrome extensions cannot contain links.
        // To get around this, use this hack:
        // https://stackoverflow.com/questions/8915845/chrome-extension-open-a-link-from-popup-html-in-a-new-tab/26216955#26216955
        document.getElementsByClassName('anchor-bottom')[ 0 ].onclick = function() {
            chrome.tabs.create({ url: this.href });
        };
    })
})();
