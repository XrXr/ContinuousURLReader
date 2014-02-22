/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 * Author: XrXrXr
 */

document.documentElement.addEventListener("start_reading", function(event) {
    start_reading(event.detail);
}, false);

document.documentElement.addEventListener("setting_dialog", function(event) {
    setting_dialog();
}, false);

function start_reading(details) {
    self.port.emit("start_reading", details);
}

function setting_dialog() {
    self.port.emit("setting_dialog");
}