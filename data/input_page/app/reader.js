/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * Author: XrXrXr
 */
const reader = angular.module('reader', ['ngAnimate', 'ngRoute', 'ui.bootstrap']);
reader.config(function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when("/", {
        templateUrl: 'partials/input.html',
        controller: input_pg_ctrl
    });
   /*
    This Angular app does not, and should not send out any network
    reqeusts. However, XHRs are sent out to fetch Angular templates on
    disk. When responseType is the default (""), Firefox tries to parse the
    response as XML. This of course failes as HTML is not valid XML, and
    XML parsers are very strict. The parse failure manifests as error
    messages in Firefox's console.
    Turns out, these errors do not effect any funcionality of the app.
    However since errors are scary, the following will set the responseType
    as "text" for every XHR fired by the app, avoiding XML parsing and
    error messages being logged.
    */
    $httpProvider.interceptors.push(function() {
      return {
       request: function(config) {
            config.responseType = "text";
            return config;
        }
      };
    });
});

function input_pg_ctrl($scope, $log) {
    button_failed($scope);
    $scope.indicator_location = -1;
    $scope.number_indicator = "";

    $scope.set_url = function(head, mid, end) {
        $scope.url_head = head;
        $scope.url_mid = mid;
        $scope.url_end = end;
    };

    $scope.update_url = function() {
        var without_protocal = $scope.url_in.slice($scope.url_in.search("//") + 2);
        if ($scope.indicator_location == -1) {
            $scope.number_indicator = "";
            if (without_protocal == -1) {
                $scope.set_url(without_protocal, "", "");
            } else {
                $scope.set_url($scope.url_in, "", "");
            }
        } else {
            $scope.number_indicator = "|";
            $scope.url_head = without_protocal.slice(0, $scope.number_locations[$scope.indicator_location][0]);
            $scope.url_mid = without_protocal.slice($scope.number_locations[$scope.indicator_location][0],
                $scope.number_locations[$scope.indicator_location][1]);
            $scope.url_end = without_protocal.slice($scope.number_locations[$scope.indicator_location][1]);
        }
    };

    $scope.find_number = function() {
        if ($scope.url_in) { //this will be empty if there isn't a protocol
            var without_protocal = $scope.url_in.slice($scope.url_in.search("//") + 2);
            var number_locations = [];
            var without_domain_length = without_protocal.search("/") + 1;
            var without_domain = "";
            if (without_domain_length !== 0){
                without_domain = without_protocal.slice(without_protocal.search("/") + 1);
            }
            while (without_domain.search(/[0-9]+/) != -1) {
                var matched_number = without_domain.match(/[0-9]+/)[0];
                var begin_location = without_domain.search(/[0-9]+/) + without_domain_length;
                var end_location = begin_location + matched_number.length;
                number_locations.push([begin_location, end_location]);
                without_domain = without_domain.replace(matched_number, s_repeat("_",matched_number.length));
            }
            $scope.number_locations = number_locations.slice(0);
            $scope.protocal_length = $scope.url_in.length - without_protocal.length;
            if (number_locations.length !== 0) { //number(s) found
                $scope.indicator_location = number_locations[$scope.indicator_location] ?
                                            $scope.indicator_location : 0;
                $scope.update_url();
                button_success($scope);
            } else {
                $scope.indicator_location = -1;
                $scope.update_url();
                button_failed($scope);
            }
        } else {
            $scope.indicator_location = -1;
            $scope.update_url();
            button_failed($scope);
        }
    };

    $scope.selector_right = function() {
        if ($scope.indicator_location != -1){
            $scope.indicator_location = ($scope.indicator_location ==
                                        $scope.number_locations.length -1) ?
                                        0 : $scope.indicator_location+1;
            $scope.update_url();
        }
    };

    $scope.selector_left = function() {
        if ($scope.indicator_location != -1){
            $scope.indicator_location = ($scope.indicator_location === 0) ?
                                        $scope.number_locations.length -1 :
                                        $scope.indicator_location-1;
            $scope.update_url();
        }
    };

    $scope.send_url = function (){
        if($scope.number_locations.length !== 0){
            var number_slice = $scope.number_locations[$scope.indicator_location].slice(0);
            for (var c = 0; c<number_slice.length; c++){
                number_slice[c] += $scope.protocal_length;
            }
            var event = new CustomEvent('start');
            event.initCustomEvent("start_reading", true, true, {
                url: $scope.url_in,
                number_slice: number_slice
             });
            document.documentElement.dispatchEvent(event);
        }
    };

    $scope.hotkey_setting= function (){
        var event = new CustomEvent('settings');
        event.initCustomEvent("setting_dialog", true, true, {});
        document.documentElement.dispatchEvent(event);
    };

    function button_success($scope, head, mid, end) {
        $scope.url_valid = true;
        $scope.button_status = "btn btn-success";
        $scope.button_text = "Start!";
    }

    function button_failed($scope, head, mid, end) {
        $scope.url_valid = false;
        $scope.button_status = "btn btn-danger";
        $scope.button_text = "Please enter a valid URL";
    }

    function s_repeat(string,num){
        return new Array(num+1).join(string);
    }
}