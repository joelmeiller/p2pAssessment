
angular
.module('ipApp', [
	    'ipApp.selfData',
	    'ipApp.allData',
  		'ui.bootstrap',
		'ui.router'/*,
        'angular-storage',
        'angular-jwt'*/
])
	  
.config(function($urlRouterProvider, $stateProvider, /*jwtInterceptorProvider,*/ $httpProvider) {
	
  $urlRouterProvider
        .when('/overview', '/overview/byCriteria')
		.when('/modify', '/modify/criteria')
        .when('/selfOverview', '/selfOverview/byCriteria')
		.when('/','/login')
	    .otherwise( '/login' );
		
  $stateProvider
	  .state('login', {
		  url: '/login',
		  templateUrl: 'tmpl/login.html',
		  data: {
			requiresLogin: true
		  }
	  });


 /* jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('jwt');
  }

  $httpProvider.interceptors.push('jwtInterceptor');*/
})
  
.run(function($rootScope, $state/*, store, jwtHelper*/) {
	
	$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
		
		var requireLogin = toState.data.requiresLogin;
	
		if (toState.data && toState.data.requiresLogin) {
/*			if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
			  event.preventDefault();
			  $state.go('login');
			}
*/			
			console.log('State "' + toState.name + '" requires login.');
		}
	});
  
	
	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, $scope) {	
	
		  $scope.filterId = "";
		  
		  
		  $rootScope.showOverview = ( toState.name == 'overview.byCriteria' || toState.name == 'overview.byTeamMember' );
   
	}); 
	
})  
  
.controller( 'ipAppCtrl', function( $rootScope, $scope, $state, LoginService, InfoService , AllDataService, SelfDataService, $modal ) {
				
	$rootScope.login = { loggedIn: false };
	$rootScope.user = {};
	$rootScope.project = { show: false };
	
	$rootScope.infoItems = [];
	
	$scope.error = { show: false };
	
	$scope.logout = function(){
		 
		 AllDataService.clear();
		 SelfDataService.clear();
		 InfoService.clear();
		 
		 LoginService.logout();
		 
		 $rootScope.project = { show: false, title: LoginService.project() };
		 $rootScope.user = {};
		 
		 $rootScope.infoItems = [];
		 $scope.error = { show: false };
		 
		 //$state.go('login');
	
	}
  	
	/*$scope.loginModal = function(){
		 $rootScope.login.show = true;
	}*/				  	
  
  	$rootScope.loginModal = function () {
	  
	  var size = 'lg';
  
	  var modalInstance = $modal.open({
		templateUrl: 'loginModal.html',
		controller: 'loginCtrl',
		size: size,
	  });
  
	  modalInstance.result.then(function (username, password) {

		   LoginService.checkLogin( username, password)
		  .then(function(){
			  
			  $rootScope.login.loggedIn = LoginService.login();
			  
			  if( $rootScope.login.loggedIn ){
				  
				  $rootScope.project.title = LoginService.project();
				  $rootScope.project.show = true;
				  
				  $rootScope.user = LoginService.user();
				  
				  
				  InfoService.loadData($rootScope.user)
				  .then(function(criteriaItems){
					  $rootScope.infoItems = criteriaItems;
				  });
				  
				  if( $rootScope.user.options.self ){
					  $state.go('selfOverview.byCriteria');
				  }else{
					  $state.go('overview.byCriteria');
				  }
			  
			  }else{
				  $scope.error = LoginService.error();
			      $state.go('login');
			  }
		  },
		  function () {
			 $state.go('login');
		  });
  
	  });
			
  }
	
  
  $rootScope.loginModal();	
	  
	 	
	// Load data and show initial screen
	$rootScope.loadInfoItems = function(){
		
		InfoService.loadData($rootScope.user)
		.then( function(){
			$rootScope.infoItems = InfoService.infoItems();
		});
	}
	
	$rootScope.deleteInfoItem = function( index ){
		// send deletion request to server
		
		$rootScope.infoItems = InfoService.deleteInfoItem($rootScope.infoItems, $rootScope.user, index);
	}
		  	 	  
})
.controller('loginCtrl', function ($scope, $modalInstance) {

  $scope.login = function () {
    $modalInstance.close($scope.username, $scope.password);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})  
.directive('bsActiveLink', ['$location', function ($location) {
    return {
        restrict: 'A', //use as attribute 
        replace: false,
        link: function (scope, elem) {
            //after the route has changed
            scope.$on("$stateChangeSuccess", function () {
                var hrefs = ['/#' + $location.path(),
                             '#' + $location.path(), //html5: false
                             $location.path()]; //html5: true
                angular.forEach(elem.find('a'), function (a) {
                    a = angular.element(a);
                    if (-1 !== hrefs.indexOf(a.attr('href'))) {
                        a.parent().addClass('active');
                    } else {
                        a.parent().removeClass('active');   
                    };
                });     
            });
        }
    }
  }]);
  

