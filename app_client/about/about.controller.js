(function () {
  angular
    .module('LRSapp')
    .controller('aboutCtrl', aboutCtrl);

  aboutCtrl.$inject = ['$routeParams', '$modal', '$scope', 'flightData', '$log', 'localStorageService' ];
  function aboutCtrl($routeParams, $modal, $scope, flightData, $log, localStorageService) {

    var vm = this;  
      

  }
})();