(function () {

  angular
    .module('LRSapp')
    .directive('navigation', navigation);
  
  navigation.$inject = ['$modal', 'flightData']
  function navigation ($modal, flightData) {
    var vm = this;

    return {
      restrict: 'EA',
      templateUrl: '/common/directives/navigation/navigation.template.html',
    };    
  }
})();