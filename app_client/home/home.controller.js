(function () {
  
  angular
    .module('LRSapp')
    .controller('homeCtrl', homeCtrl);

  homeCtrl.$inject = ['$modal', '$scope', 'flightData', '$log', 'localStorageService'];
  function homeCtrl ($modal, $scope, flightData, $log, localStorageService) {
  var vm = this;
      

  }
})();

