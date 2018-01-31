// The injected script is responsible for all the internal logic of the extension.
( function() {
    "use strict";

    // Panel and link_panel contain the DOM node created on app init.
    var panel;
    var link_panel;

    // Used for displaying the alt_code.
    var os_code = '';

    // Used to ensure keybinds only execute when the panel is active.
    var is_panel_showing = false;

    // The current result set being displayed.
    var cur_index = 0;

    // How many entries are navigated on left/right, up/down.
    var page_low_amount = 10;
    var page_high_amount = 50;

    // Our current search term.
    var filter_input = '';

    // Given an array of elements, return an array with all duplicates removed.
    // The native EC6 filter methods cause noticable lag with arrays with > 2000 entries.
    function remove_duplicates( arr ) {
        var temp_map = {};
        var temp_arr = [];

        for ( var i = 0; i < arr.length; i++ ) {
            var cur_element = arr[ i ];

            if ( !temp_map[ cur_element ] ) {
                temp_arr.push( cur_element );
                temp_map[ cur_element ] = true;
            }
        }

        return temp_arr;
    }

    // Returns an array with all unique links on a page with filter_input applied.
    function retrieve_page_links( ) {
        var all_links = Array.from( document.querySelectorAll( 'a ') );
        all_links = remove_duplicates( all_links );

        if( filter_input.length > 0 ) {
            all_links = all_links.filter( function( link ) {
                return link.href.toLowerCase().indexOf( filter_input.toLowerCase() ) != -1 || link.text.toLowerCase().indexOf( filter_input.toLowerCase() ) != -1; 
            });
        }

        return all_links;
    }

    // Given our current index, disable/enable the navigation feedback arrows.
    function toggle_arrow_visibility() {
        var all_links = retrieve_page_links( );

        document.getElementsByClassName( 'left-arrow-panel' )[ 0 ].style.visibility = "visible";
        document.getElementsByClassName( 'right-arrow-panel' )[ 0 ].style.visibility = "visible";

        if( cur_index == 0 ) {
            document.getElementsByClassName( 'left-arrow-panel' )[ 0 ].style.visibility = "hidden";
        }

        if( all_links.length <= page_low_amount ) {
            document.getElementsByClassName( 'right-arrow-panel' )[ 0 ].style.visibility = "hidden";
        }

        if( cur_index + page_low_amount >= all_links.length ) {
            document.getElementsByClassName( 'right-arrow-panel' )[ 0 ].style.visibility = "hidden";
        }
    }

    // Create our link panel inside the page.
    function create_link_panel( ) {
        panel = document.createElement( 'div' );
        panel.className = 'collector-panel';
        panel.style.cssText = "max-width:" + window.innerWidth / 2 + "px;";

        var close_panel = document.createElement( 'span' );
        close_panel.className = 'close-panel';

        panel.appendChild( close_panel );

        var instruction_panel = document.createElement( 'div' );
        var alt_code = ( navigator.appVersion.indexOf( "Mac" ) != -1 ? "⌥" : "Alt" );

        if( alt_code == "⌥") {
            os_code = '-mac';
        }

        instruction_panel.className = 'instruction-panel';
        instruction_panel.innerText = alt_code + " + ◀/▶ to page " + page_low_amount + " results. " + 
            alt_code + " + ▼/▲ to page " + page_high_amount + " results. " + alt_code + 
            " + number to select. " + alt_code + " + f to search.";

        panel.appendChild( instruction_panel ); 

        var find_panel = document.createElement( 'div' );
        find_panel.className = 'find-panel' + os_code;

        var find_search_box = document.createElement( 'input' );
        find_search_box.className = 'find-panel-input mousetrap';
        find_panel.appendChild( find_search_box );
        find_panel.style.display = 'none';

        panel.appendChild( find_panel );

        var left_arrow_panel = document.createElement( 'div' );
        left_arrow_panel.className = 'left-arrow-panel left-arrow-animation';

        panel.appendChild( left_arrow_panel );

        var right_arrow_panel = document.createElement( 'div' );
        right_arrow_panel.className = 'right-arrow-panel right-arrow-animation';

        panel.appendChild( right_arrow_panel );

        create_links_shown_panel( cur_index );

        document.body.appendChild( panel );

        document.getElementsByClassName( 'left-arrow-panel' )[ 0 ].style.height = document.getElementsByClassName( 'collector-panel' )[ 0 ].clientHeight - 40 + "px";
        document.getElementsByClassName( 'right-arrow-panel' )[ 0 ].style.height = document.getElementsByClassName( 'collector-panel' )[ 0 ].clientHeight - 40 + "px";
    }

    // Append the links on the page to our parent panel.
    function create_links_shown_panel( index ) {
        link_panel = document.createElement( 'div' );
        link_panel.className = 'link-collector-panel';

        var all_links = retrieve_page_links( );

        if( all_links.length == 0 ) {
            var temp_link = document.createElement( 'div' );

            temp_link.innerHTML = 'No links on page.';

            link_panel.appendChild( temp_link );
        }
        else {
            for( var i = index; i < all_links.length && i < index + page_low_amount; i++ ) {
                var temp_link = document.createElement( 'div' );

                var cur_index_display = ( '' + i ).substr( 0, ( '' + i ).length - 1 );
                temp_link.innerHTML = ( i > 9 ? "(" + cur_index_display + ")" + ( i - index ) : i ) + ". " + 
                    "<a class='collector-link' href='" + all_links[ i ].href + "'>" + "<strong>" + all_links[ i ].text.substr(0, 100).replace(/<\/?[^>]+(>|$)/g, "") +
                    "</strong> (" + all_links[ i ].href.substr(0, 100).replace(/<\/?[^>]+(>|$)/g, "") + ")</a>";

                link_panel.appendChild( temp_link );
            }
        }

        panel.appendChild( link_panel );
    }

    // Toggle the panel visibile/hidden.
    function toggle_panel( ) {
        if( is_panel_showing ) {
            document.body.removeChild( panel );
        }
        else {
            create_link_panel( );

            document.getElementsByClassName( 'close-panel' )[ 0 ].onclick = function() {
                toggle_panel( );
            };

            document.getElementsByClassName( 'left-arrow-panel' )[ 0 ].onclick = function() {
                page_results_low('alt+left')
            };

            document.getElementsByClassName( 'right-arrow-panel' )[ 0 ].onclick = function() {
                page_results_low('alt+right')
            };

            toggle_arrow_visibility( );
        }

        is_panel_showing = !is_panel_showing;
    }

    function page_results_low(combo) {
        if( is_panel_showing ) {
            if( combo == 'alt+left' && cur_index - page_low_amount >= 0 ) {
                cur_index -= page_low_amount;
            }
            else if( combo == 'alt+right' ) {
                var all_links = retrieve_page_links( );

                if( cur_index + page_low_amount < all_links.length ) {
                    cur_index += page_low_amount;
                }
            }

            panel.removeChild( link_panel );
            create_links_shown_panel( cur_index );

            toggle_arrow_visibility( );

            return false;
        }
    }

    // On a context_menu message from the background or the toggle_panel command, toggle the panel.
    chrome.extension.onMessage.addListener( function ( message, sender, callback ) {
        if ( message.function == "context_menu_clicked" || message.function == "toggle_panel" ) {
            toggle_panel( );
        }   
    });

    // On alt+num, grab the num and navigate to the entry selected.
    Mousetrap.bind(['alt+0', 'alt+1', 'alt+2', 'alt+3', 'alt+4', 'alt+5', 'alt+6', 'alt+7', 'alt+8', 'alt+9' ], function( e, combo ) {
        if( is_panel_showing ) {
            var index_selected = combo.substr( combo.indexOf("+") + 1 );

            window.location = document.getElementsByClassName('collector-link')[ index_selected ].href;
        
            return false;
        }
    });

    // On left/right, offset the results displayed by page_low_amount.
    Mousetrap.bind([ 'alt+right', 'alt+left' ], function( e, combo ) {
        page_results_low(combo);
    });

     // On up/down, offset the results displayed by page_high_amount.
    Mousetrap.bind([ 'alt+up', 'alt+down' ], function( e, combo ) {
        if( is_panel_showing ) {
            if( combo == 'alt+up' ) {
                if( cur_index - page_high_amount <= 0 ) {
                    cur_index = 0;
                }
                else {
                    cur_index -= page_high_amount;
                }
            }
            else {
                var all_links = retrieve_page_links( );

                if( cur_index + page_high_amount >= all_links.length ) {
                    cur_index = all_links.length - ( all_links.length % page_low_amount );

                    if( cur_index == all_links.length ) {
                        cur_index -= page_low_amount;
                    }
                }
                else {
                    cur_index += page_high_amount;
                }
            }

            panel.removeChild( link_panel );
            create_links_shown_panel( cur_index );
            
            toggle_arrow_visibility( );

            return false;
        }
    });

    // On alt+f, toggle the vis of the filter input box.
    Mousetrap.bind( 'alt+f', function() {
        if( is_panel_showing ) {
            if( document.getElementsByClassName( 'find-panel' + os_code )[ 0 ].style.display == 'none' ) {
                document.getElementsByClassName( 'find-panel' + os_code )[ 0 ].style.display = 'block';
                document.getElementsByClassName( 'find-panel-input' )[ 0 ].focus( );
            }
            else {
                filter_input = '';
                cur_index = 0;
                document.getElementsByClassName( 'find-panel-input' )[ 0 ].value = filter_input;
                document.getElementsByClassName( 'find-panel' + os_code )[ 0 ].style.display = 'none';

                panel.removeChild( link_panel );
                create_links_shown_panel( cur_index );

                toggle_arrow_visibility( );
            }

            return false;
        }
    });

    // On alt+enter, apply the filter_input over the links.
    Mousetrap.bind( 'alt+enter', function() {
        if( is_panel_showing ) {
            filter_input = document.getElementsByClassName( 'find-panel-input' )[ 0 ].value;

            cur_index = 0;

            panel.removeChild( link_panel );
            create_links_shown_panel( cur_index );

            toggle_arrow_visibility( );

            return false;
        }
    });
})();
