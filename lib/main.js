/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Author: XrXrXr
 */
const {Cc, Ci} = require("chrome");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var page_mod = require("sdk/page-mod");
var hotkeys = require("sdk/hotkeys");
var window_util = require("sdk/window/utils");
var prefs = require("sdk/simple-prefs");
var ss = require("sdk/simple-storage");

var input_page_url = self.data.url("input_page/index.html");
var previous_hk = null;
var next_hk = null;
var reader_tab = [];
if (ss.storage.reader_tab){
    reader_tab = ss.storage.reader_tab.slice(0);
}

function hotkey_settings() {
    var leftPosition, topPosition;
    var window = window_util.getMostRecentBrowserWindow();
    leftPosition = (window.screen.width / 2 - 100);
    topPosition = (window.screen.height / 2 - 200);
    window.openDialog("chrome://continuousurlreader/content/hotkeyConfig.xul", "",
        "chrome,left=" + leftPosition + ",top=" + topPosition + ",screenX=" +
        leftPosition + ",screenY=" + topPosition);
}

function hotkey_update() {
    if (previous_hk !== null)
        previous_hk.destroy();

    if (next_hk !== null)
        next_hk.destroy();

    var previous_hk_str = prefs.prefs.previous_page_hotkey;
    var next_hk_str = prefs.prefs.next_page_hotkey;
    hotkeys.Hotkey({
        combo: previous_hk_str,
        onPress: function() {
            //console.log("hotkey is working, previous");
            for (var c = 0; c<reader_tab.length; c++){
                if (reader_tab[c].tab === tabs.activeTab){
                    if (reader_tab[c].number_location !== null){
                        let processed_url = new_url(reader_tab[c].tab.url,
                                            reader_tab[c].number_location, -1);
                        if (reader_tab[c].tab.url != processed_url)
                            reader_tab[c].tab.url = processed_url;
                    }
                }
            }
        }
    });

    hotkeys.Hotkey({
        combo: next_hk_str,
        onPress: function() {
            //console.log("hotkey is working, next");
            for (var c = 0; c<reader_tab.length; c++){
                if (reader_tab[c].tab === tabs.activeTab){
                    // console.log(tabs.activeTab.url);
                    if (reader_tab[c].number_location !== null){
                        reader_tab[c].tab.url = new_url(reader_tab[c].tab.url,
                                                reader_tab[c].number_location, 1);
                    }
                }
            }
        }
    });
}

function new_url(url, number_location, step){
    var current_number = parseInt(url.slice(number_location).match(/[0-9]+/),10);
    if ((current_number + step) < 0)
        return url;
    var processed_url = url.slice(0,number_location) +
                  url.slice(number_location)
                  .replace(current_number,current_number + step);
    return processed_url;
}

function start_reading(details){
    // console.log("I got a message from the content script! I will start reading with " +
    //     details.url + " with number at " + details.number_slice);
    for (var c = 0; c<reader_tab.length; c++){
        if (reader_tab[c].tab === tabs.activeTab){
            // console.log("found activate tab and now starting to read");
            reader_tab[c].number_location = details.number_slice[0];
        }
    }
    tabs.activeTab.url = details.url;
}

require("sdk/widget").Widget({
    id: "ContinuousURLReader",
    label: "Click to start reading!",
    contentURL: self.data.url("icon_idle.svg"),
    onClick: function() {
        let w_self = this;
        tabs.open({
            url: input_page_url,
            onOpen: function() {
                reader_tab.push({
                    tab: this,
                    number_location: null
                });
                ss.storage.reader_tab = reader_tab.slice(0);
            },
            onClose: function() {
                for (var c = 0; c < reader_tab.length; c++) {
                    if (reader_tab[c].tab === this){
                        reader_tab.splice(c);
                        //console.log("removal succesful");
                        break;
                    }
                }
                w_self.contentURL = self.data.url("icon_idle.svg");
            },
            onActivate: function() {
                w_self.contentURL = self.data.url("icon_active.svg");
            },
            onDeactivate: function() {
                w_self.contentURL = self.data.url("icon_idle.svg");
            }
        });
    }
});

page_mod.PageMod({
    include: input_page_url + "*", //the hashbang at the end
    contentScriptFile: self.data.url("content.js"),
    onAttach: function(worker) {
        worker.port.on('start_reading', start_reading);
        worker.port.on('setting_dialog', function(details) {
            hotkey_settings();
        });
    }
});

var prefObserver = {
    register: function() {
        // First we'll need the preference services to look for preferences.
        var prefService = Cc["@mozilla.org/preferences-service;1"]
            .getService(Ci.nsIPrefService);

        // For this.branch we ask for the preferences for extensions.myextension. and children
        this.branch = prefService.getBranch("extensions.continuous-url-reader@xrxrxr.com.");

        // Now we queue the interface called nsIPrefBranch2. This interface is described as:  
        // "nsIPrefBranch2 allows clients to observe changes to pref values."
        // This is only necessary prior to Gecko 13
        if (!("addObserver" in this.branch))
            this.branch.QueryInterface(Ci.nsIPrefBranch2);

        // Finally add the observer.
        this.branch.addObserver("", this, false);
    },

    unregister: function() {
        this.branch.removeObserver("", this);
    },

    observe: function(aSubject, aTopic, aData) {
        // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
        // aData is the name of the pref that's been changed (relative to aSubject)
        hotkey_update();
    }
};
prefObserver.register();

prefs.on("hotkey_settings", function() {
    hotkey_settings();
});

prefs.on("previous_page_hotkey", function() {
    hotkey_update();
});

prefs.on("previous_page_hotkey", function() {
    hotkey_update();
});

hotkey_update();
// hotkey_settings();
// window_util.getMostRecentBrowserWindow().openDialog("chrome://continuousurlreader/content/hotkeyConfig.xul", "", "chrome");