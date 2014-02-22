/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Author: XrXrXr
 */

// Hotkey config window code based on keyconfig by Dorando. Huge thanks!
var gDocument, gLocation, gProfile, gKeys, gUsedKeys, gRemovedKeys;

var gExtra2, keyTree, gEditbox, gEdit;
var gUnicodeConverter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter']
    .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

var gPrefService = Components.classes['@mozilla.org/preferences-service;1']
    .getService(Components.interfaces.nsIPrefService).getBranch("");

var WindowMediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
    .getService(Components.interfaces.nsIWindowMediator);

var gLocaleKeys;
var gReverseNames;
var gEditPrev;
var gEditNext;
var gPlatformKeys = {};
var gVKNames = [];
var prevRaw = "";
var nextRaw = "";

function onLoad() {
    console.log(window.location.href);
    gUnicodeConverter.charset = "UTF-8";

    gExtra2 = document.documentElement.getButton("extra2");
    keyTree = document.getElementById("key-tree");
    gEditbox = document.getElementById("editbox");
    gEditPrev = document.getElementById("edit-left");
    gEditNext = document.getElementById("edit-right");
    gLocaleKeys = document.getElementById("localeKeys");


    var platformKeys = document.getElementById("platformKeys");
    gPlatformKeys.shift = platformKeys.getString("VK_SHIFT");
    gPlatformKeys.meta = platformKeys.getString("VK_META");
    gPlatformKeys.alt = platformKeys.getString("VK_ALT");
    gPlatformKeys.ctrl = platformKeys.getString("VK_CONTROL");
    gPlatformKeys.sep = platformKeys.getString("MODIFIER_SEPARATOR");
    switch (gPrefService.getIntPref("ui.key.accelKey")) {
        case 17:
            gPlatformKeys.accel = gPlatformKeys.ctrl;
            break;
        case 18:
            gPlatformKeys.accel = gPlatformKeys.alt;
            break;
        case 224:
            gPlatformKeys.accel = gPlatformKeys.meta;
            break;
        default:
            gPlatformKeys.accel = (window.navigator.platform.search("Mac") === 0 ? gPlatformKeys.meta : gPlatformKeys.ctrl);
    }

    for (var property in KeyEvent) {
        gVKNames[KeyEvent[property]] = property.replace("DOM_", "");
    }
    gVKNames[8] = "VK_BACK";

    prevRaw = gPrefService.getCharPref("extensions.continuous-url-reader@xrxrxr.com.previous_page_hotkey_raw");
    nextRaw = gPrefService.getCharPref("extensions.continuous-url-reader@xrxrxr.com.next_page_hotkey_raw");

    var prevCombo = prevRaw.split("|");
    var nextCombo = nextRaw.split("|");
    gEditPrev.value = getFormattedKey(prevCombo[0],prevCombo[1],prevCombo[2]);
    gEditNext.value = getFormattedKey(nextCombo[0],nextCombo[1],nextCombo[2]);
}

function onSave() {
    gPrefService.setCharPref("extensions.continuous-url-reader@xrxrxr.com.previous_page_hotkey_raw",prevRaw);
    gPrefService.setCharPref("extensions.continuous-url-reader@xrxrxr.com.next_page_hotkey_raw",nextRaw);

    if (gEditPrev.keys)
        gPrefService.setCharPref("extensions.continuous-url-reader@xrxrxr.com.previous_page_hotkey",gEditPrev.keys);
    if (gEditNext.keys)
        gPrefService.setCharPref("extensions.continuous-url-reader@xrxrxr.com.next_page_hotkey",gEditNext.keys);
    console.log(gPrefService.getCharPref("extensions.continuous-url-reader@xrxrxr.com.next_page_hotkey_raw"));
}

function getFormattedKey(modifiers, key, keycode) {
    if (!key && !keycode)
        return 'Not Set';

    var val = "";
    if (modifiers) val = modifiers
        .replace(/^[\s,]+|[\s,]+$/g, "").split(/[\s,]+/g).join(gPlatformKeys.sep)
        .replace("alt", gPlatformKeys.alt)
        .replace("shift", gPlatformKeys.shift)
        .replace("control", gPlatformKeys.ctrl)
        .replace("meta", gPlatformKeys.meta)
        .replace("accel", gPlatformKeys.accel) + gPlatformKeys.sep;
    if (key == " ") {
        key = "";
        keycode = "VK_SPACE";
    }
    if (key)
        val += key;
    if (keycode) try {
        val += gLocaleKeys.getString(keycode);
    } catch (e) {
        val += '<' + keycode + '>';
    }

    return val;
}

function recognize(event, which) {
    event.preventDefault();
    event.stopPropagation();

    var modifiers = [];
    if (event.ctrlKey) modifiers.push("control");
    if (event.metaKey) modifiers.push("meta");
    if (event.shiftKey) modifiers.push("shift");
    if (event.altKey) modifiers.push("alt");
    if (modifiers.length === 0)
        return;
    modifiers = modifiers.join(" ");

    var key = null;
    var keycode = null;
    if (event.charCode) {
        key = String.fromCharCode(event.charCode).toUpperCase();
        if ((modifiers == 'control' || modifiers == 'meta') &&
            (key == 'Z' || key == 'C' || key == 'X' || key == 'V' || key == 'Q')) { //warn user about potential issue
            window.setTimeout(alert, 0, "This hotkey is used by Firefox, using it will likely cause issues");
        }
    } else {
        keycode = gVKNames[event.keyCode];
        if (!keycode) return;
    }
    console.log(modifiers, key, keycode);

    if (which === 0) {
        if (keycode)
            gEditPrev.keys = [modifiers.replace(" ","-"), keycode.replace("VK_","").replace("_","")].join('-').toLowerCase();
        else
            gEditPrev.keys = [modifiers.replace(" ","-"), String.fromCharCode(event.charCode).replace(" ","space")].join('-').toLowerCase();
        gEditPrev.value = getFormattedKey(modifiers, key, keycode);
        prevRaw = [modifiers, key, keycode].join('|');
    } else {
        if (keycode)
            gEditNext.keys = [modifiers.replace(" ","-"), keycode.replace("VK_","").replace("_","")].join('-').toLowerCase();
        else
            gEditNext.keys = [modifiers.replace(" ","-"), String.fromCharCode(event.charCode).replace(" ","space")].join('-').toLowerCase();
        nextRaw = [modifiers, key, keycode].join('|');
        gEditNext.value = getFormattedKey(modifiers, key, keycode);
    }
    console.log(gEditPrev.keys);
    console.log(gEditNext.keys);
}