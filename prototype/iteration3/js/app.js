
angular
.module('ipApp', [
	    'ipApp.data',
  		'ui.bootstrap',
		'ui.router'/*,
        'angular-storage',
        'angular-jwt'*/
])
	  
.config(function($urlRouterProvider, $stateProvider, /*jwtInterceptorProvider,*/ $httpProvider) {
	
  $urlRouterProvider
        .when('/overview', '/overview/byCriteria')
		.when('/modify', '/modify/criteria')
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
  
})  
  
.controller( 'ipAppCtrl', function( $rootScope, $scope, $state, LoginService, InfoService  ) {
				
	$rootScope.login = { show: true , loggedIn: false };
	$rootScope.user = {};
	$rootScope.project = { show: false };
	
	$scope.infoItems = [];
	$scope.error = { show: false };
	
				
	$scope.logout = function(){
		 
		 LoginService.logout();
		 
		 $rootScope.project = { show: false, title: LoginService.project() };
		 $rootScope.user = {};
		 
		 $scope.infoItems = [];
		 $scope.error = { show: false };
		 //$state.go('login');
	
	}
  	
	$scope.loginModal = function(){
		 $rootScope.login.show = true;
	}				  	
  
  	
  
	$scope.checkLogin = function(){
		
		$rootScope.login.show = false;		
		
		LoginService.checkLogin( $scope.username, $scope.password)
		.then(function(){
			
			$rootScope.login.loggedIn = LoginService.login();
			
			if( $rootScope.login.loggedIn ){
				
				$rootScope.project.title = LoginService.project();
				$rootScope.project.show = true;
				
				$rootScope.user = LoginService.user();
				
				
				InfoService.loadData($rootScope.user)
				.then(function(criteriaItems){
					$scope.infoItems = criteriaItems;
				});
			
				$state.go('overview.byCriteria');
			
			}else{
				$scope.error = LoginService.error();
			}
		});
	}
	 	
	// Load data and show initial screen
	$scope.loadInfoItems = function(){
		
		InfoService.loadData($rootScope.user)
		.then( function(){
			$rootScope.infoItems = InfoService.infoItems();
		});
	}
	
	$scope.deleteInfoItem = function( index ){
		// send deletion request to server
		
		$scope.infoItems = InfoService.deleteInfoItem($scope.infoItems, $rootScope.user, index);
	}
		

	  
	function setActive( newElem , oldElem ){
		
		if( angular.isDefined( oldElem ) ){
		  angular.element(oldElem).removeClass( 'active' );
		}
		angular.element(newElem).addClass( 'active' );
	}
		  	 	  
})
.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">{{ title }}</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
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
  

