var reader = angular.module('reader', ['ngAnimate','ngRoute']);
reader.config(function ($routeProvider,$locationProvider,$httpProvider) {
    $httpProvider.defaults.headers.common["X-Requested-With"] = undefined;
    $routeProvider.when('/', {
		templateUrl: 'input.html',
		controller: input_pg
    });
});

function input_pg($scope,$log){
	$scope.find_number = function(){
		if ($scope.url_in){
			var begin = $scope.url_in.search("//")+2;
			if (begin != 1){
				var without_protocal = $scope.url_in.slice(begin);
				$scope.processed_url = without_protocal;
			}else{
				$scope.processed_url = $scope.url_in;
			}
			var numbers_location = $scope.url_in.search("[0-9]*$");

		}else{
			$scope.processed_url = "";
		}
	};
}