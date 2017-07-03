"use strict";

// Detect the OS and change the alt key display.
var alt_code = ( navigator.appVersion.indexOf( "Mac" ) != -1 ? "⌥" : "Alt" );

document.getElementsByName('key-instructions')[0].placeholder = alt_code + " + i";

// By default, popup settings in Chrome extensions cannot contain links.
// To get around this, use this hack:
// https://stackoverflow.com/questions/8915845/chrome-extension-open-a-link-from-popup-html-in-a-new-tab/26216955#26216955
window.addEventListener( 'click', function( e ) {
    if( e.target.href !== undefined ){
        chrome.tabs.create( { url: e.target.href } );
    }
});
