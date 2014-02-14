var reader = angular.module('reader', ['ngAnimate','ngRoute']);
reader.config(function ($routeProvider,$locationProvider,$httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = undefined;
    $routeProvider.when("/", {
		templateUrl: 'input.html',
		controller: input_pg
    });
    $locationProvider.html5Mode(true);
});

function input_pg($scope,$log){
	button_failed($scope);
	$scope.find_number = function(){
		if ($scope.url_in){
			var begin = $scope.url_in.search("//")+2;
			if (begin != 1){
				var without_protocal = $scope.url_in.slice(begin);
				var number_location = without_protocal.search("[0-9]+$");
				if (number_location != -1){
					var before = without_protocal.slice(0,number_location-1);
					var after = without_protocal.slice(number_location);
					var indicator = "!";
					set_url($scope,before,after,"");
					button_success($scope);
				}else{
					set_url($scope,$scope.url_in,"","");
					button_failed($scope);
				}
			}else{
				set_url($scope,$scope.url_in,"","");
				button_failed($scope);
			}
		}else{
			set_url($scope,"","","");
			button_failed($scope);
		}
	};
}

function set_url($scope,head,mid,end){
	$scope.url_head = head;
	$scope.url_mid = mid;
	$scope.url_end = end;
}

function button_success($scope,head,mid,end){
	$scope.button_status="btn btn-success";
	$scope.button_text="Start!";
}

function button_failed($scope,head,mid,end){
	$scope.button_status="btn btn-danger";
	$scope.button_text="Please enter a valid URL";
}