
  var app = angular.module('ipApp', ['ui.bootstrap','ui.router']);
  
  var whenConfig = ['$urlRouterProvider', function($urlRouterProvider) {
	
	  $urlRouterProvider.otherwise( '/projektbeschrieb' );
  }];
  
  var stateConfig = ['$stateProvider', function($stateProvider) {
	
	$stateProvider
        
        .state('projektbeschrieb', {
            url: '/projektbeschrieb/:id',
			templateUrl: 'page/projektbeschrieb.html'
        })

        .state('solutiondesign', {
            url: '/solutiondesign',
            templateUrl: 'page/solutiondesign.html'
        })
        
        .state('installation', {
            url: '/installation',
            templateUrl: 'page/installation.html'
        })
		
		.state('prototype', {
            url: '/prototype',
            templateUrl: 'page/prototype.html'
        })
		
		.state('userguide', {
            url: '/userguide',
            templateUrl: 'page/userguide.html'
        })
		
		.state('development', {
            url: '/development',
            templateUrl: 'page/development.html'
        })
		
		.state('testing', {
            url: '/testing',
            templateUrl: 'page/testing.html'
        })
  }];
	
  app.config(whenConfig) 
  app.config(stateConfig)
  app.run(function($rootScope, $location, $anchorScroll) {
	//when the route is changed scroll to the proper element.
	$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
	  $location.hash(toParams.id);
	  $anchorScroll();  
	});
  }); 
  app.controller( 'ipAppCtrl', function($scope, $location) {
	 
	$scope.scrollTo = function(id) {
		var old = $location.hash();
		$location.hash(id);
		$anchorScroll();
		//reset to old to keep any additional routing logic from kicking in
		$location.hash(old);
	};
	 	  
  });