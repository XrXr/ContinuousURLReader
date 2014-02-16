var reader = angular.module('reader', ['ngAnimate', 'ngRoute', 'ui.bootstrap']);
reader.config(function($routeProvider, $locationProvider, $httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = undefined;
    $routeProvider.when("/", {
        templateUrl: 'input.html',
        controller: input_pg_ctrl
    });
    $locationProvider.html5Mode(true);
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

    $scope.update_url = function update_url() {
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
        if ($scope.url_in) { //this will be empty if there isn't a protalcal
            var without_protocal = $scope.url_in.slice($scope.url_in.search("//") + 2);
            var number_location = without_protocal.search(/[0-9]+$/);
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
            if (number_locations.length !== 0) { //number(s) found
                $scope.indicator_location = 0;
                $scope.update_url();
                button_success($scope);
            } else {
                $scope.indicator_location = -1;
                $scope.update_url();
                button_failed($scope);
            }
        } else {
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

    function button_success($scope, head, mid, end) {
        $scope.button_status = "btn btn-success";
        $scope.button_text = "Start!";
    }

    function button_failed($scope, head, mid, end) {
        $scope.button_status = "btn btn-danger";
        $scope.button_text = "Please enter a valid URL";
    }

    function s_repeat(string,num){
        return new Array(num+1).join(string);
    }
}




