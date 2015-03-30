(function () {
  
angular.module('LRSapp',['ngRoute', 'ngSanitize', 'ui.bootstrap', 'LocalStorageModule']);

config.$inject = ['$routeProvider', '$locationProvider', 'localStorageServiceProvider'];
function config ($routeProvider, $locationProvider, localStorageServiceProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'home/home.view.html',
      controller: 'homeCtrl',
      controllerAs: 'vm'
    })
    .when('/about', {
      templateUrl: 'about/about.view.html',
      controller: 'aboutCtrl',
      controllerAs: 'vm'
    })
    .otherwise({redirectTo: '/'});

    //remove gnarly /#/ from html route
    $locationProvider.html5Mode(true);

    //Configure local storage
    localStorageServiceProvider
      .setStorageType('localStorage');
}

angular
  .module('LRSapp')
  .config(['$routeProvider', '$locationProvider', 'localStorageServiceProvider', config]);
})();