
  var app = angular.module('ipApp', ['ui.bootstrap','ui.router']);
  
  var onChangeConfig = ['$rootScope', '$state',
   function ($rootScope, $state ) {
	     
	$rootScope.$on('$stateChangeStart', function (event, toState) {    
	  if (toState.name === "overview") { 
		event.preventDefault();
		$state.go('overview.overviewByCriteria');
	  }
	});
  }]
  
  var whenConfig = ['$urlRouterProvider', function($urlRouterProvider) {
	
	  $urlRouterProvider
		.when('/overview', '/overview/overviewByCriteria')
	    .otherwise( '/login' );
  }];
  
  var stateConfig = ['$stateProvider', function($stateProvider) {
	
	$stateProvider
        // Login
        .state('login', {
            url: '/login',
			templateUrl: 'tmpl/login.html'
        })

        // Overview
        .state('overview', {
            url: '/overview',
            templateUrl: 'tmpl/teammember/overview.html'
        })
        
        .state('overview.overviewByCriteria', {
            url: '/overviewByCriteria',
			views: {
			'overviewby@overview' : {
			    templateUrl: 'tmpl/teammember/overviewByCriteria.html'
			  }
            }
        })

        .state('overview.overviewByTeammember', {
            url: '/overviewByTeammember',
			views: {
			'overviewby@overview' : {
			    templateUrl: 'tmpl/teammember/overviewByTeammember.html'
			  }
            }
        })

        // Rating Form
        .state('ratingForm', {
            url: '/ratingForm',
            templateUrl: 'tmpl/teammember/ratingForm.html',
			controller: 'ratingFormCtrl'
        })
  }];

  app.config(whenConfig) 
  app.config(stateConfig)
  app.run(onChangeConfig)
    
  app.controller( 'ipAppCtrl', function($scope, $http, $state) {
	  
	  $scope.initialize = function(showLoginModal){
		$scope.showLogin = showLoginModal;
		$scope.loggedIn = false;
		$scope.showContent = false;
		$scope.showInfo = false;
		$scope.project = {};
		$scope.user = {};	 
		$scope.informationItem = { id: "closedRating" }; 
		$scope.informationItems = [];
	  }
	  
	  $scope.initialize(true);
	  
  
	  $scope.loginModal = function(){
	    $scope.showLogin = true;
	  }				  	
	  
	  $scope.login = function(){
	  		$http.get("php/checkLogin.json")
			  .success(function(response) {
				  if( response.loginState == "200" ){
					  
					 $scope.user = response.user;
					 $scope.project = response.project;
					 $scope.loggedIn = true;
					 
				  	 $scope.loadData();
					 
				  }
			  });
	  }
	  
	  $scope.logout = function(){
		  
		 $scope.loggedIn = false;
		 $scope.initialize(false);
		 
		 $state.go('login');

	  }

	  // Load data and show initial screen
	  $scope.loadData = function(){
		  
		  $http.get("php/getUserInformationList.json")
		    .success(function(response) {
				
				$scope.informationItems = response.informationItems;
				
				$scope.deleteInfo = function( index ){
					// send deletion request to server
					$scope.informationItems.splice(index, 1);
				}
		  
		    });
		  
		  $scope.ratingClosed = ($scope.user.ratingState == "closed");
		  
		  $http.get("php/getCriteriaList.json")
		    .success(function(response) {
				
			  $scope.criteriaItems = response.criteriaItems;
					  
			  $scope.showLogin = false;
			  $scope.showContent = true;
			  
			  $scope.showBack = false;
			  
			  $http.get("php/getUserRatingList.json")
				  .success(function(response) {
																
					  $scope.user.ratedPersonItems = response.user.ratedPersonItems;
						
					  //  Initialize rated Persons with criteriaItemsRating
					  // (required for nested ng-repeat of radio buttons)
					  for( var i = 0; i < $scope.user.ratedPersonItems.length; i++){
						  var j = 0;
						  while( j < $scope.user.ratedPersonItems[i].criteriaItems.length ){
							  $scope.user.ratedPersonItems[i].criteriaItems[j].topic = $scope.criteriaItems[j].topic;
							  $scope.user.ratedPersonItems[i].criteriaItems[j].criteriaRatingItems = $scope.criteriaItems[j].ratingItems;
							  j++;
						  }
						  while( j < $scope.criteriaItems.length ){
							  $scope.user.ratedPersonItems[i].criteriaItems.push( {} );
							  $scope.user.ratedPersonItems[i].criteriaItems[j].id = $scope.criteriaItems[j].id;
							  $scope.user.ratedPersonItems[i].criteriaItems[j].topic = $scope.criteriaItems[j].topic;
							  $scope.user.ratedPersonItems[i].criteriaItems[j].criteriaRatingItems = $scope.criteriaItems[j].ratingItems;	
							  j++;					  
					      }
					  };

					  $scope.overviewText = "Übersicht";
					  $scope.backItem = { text: "back" };
					  $scope.nextItem = { text: "next" , index: 0 };
					  	
					  $state.go('overview.overviewByCriteria');	
						
					  $scope.closeUserRating = function(){
						  
						  if( $scope.validateUserRating() ){					  
							$scope.user.ratingState = "closed";
							$scope.ratingClosed = true;
						  }
					  };
					  
					  $scope.validateUserRating = function(){
						  
						  var invalidUsers = [];
						  var isValid = true;
						  var userIx = 0;
					  
					      //Iteration over all team members
						  while( userIx < $scope.user.ratedPersonItems.length ){
							
							var critIx = 0;
							var valid = true;
							var ratedMember = $scope.user.ratedPersonItems[userIx]
							
							//Iteration over all ratings per team member (as long as they exists)
							while( valid && critIx < ratedMember.criteriaItems.length ){
							
							   if( angular.isUndefined( ratedMember.criteriaItems[ critIx ].rating ) ){
								  invalidUsers.push( ratedMember.name );
							   	  valid = isValid = false; 
							   }
							   critIx++;
							}
							  
						    userIx++;
						  }
					  	
						  var index = $scope.informationItems.indexOf($scope.informationItem);
						  if (index != -1) {
							  $scope.informationItems.splice(index, 1);
						  }
						  						  
					  	  if( isValid ){
							$scope.informationItem.text = "Die Bewertung ist abgeschlossen";
							$scope.informationItem.type = "success";
							
						  }else{
						  	$scope.informationItem.text = "Das P2P Assessment konnte nicht abgeschlossen werden. Es fehlen Bewertungen für " + invalidUsers[0];
							$scope.informationItem.type = "danger";
							
							for( var i=1; i < invalidUsers.length - 1; i++ ){
							  $scope.informationItem.text += ", " + invalidUsers[i];
							}
							if( invalidUsers.length > 1 ){
							  $scope.informationItem.text += " und " + invalidUsers[invalidUsers.length - 1];
							}
							$scope.informationItem.text += ".";
						  }
						  
						  $scope.informationItems.push( $scope.informationItem );
						  
						  return isValid;
					  };
				 });
			});
	  }
			  
	 	  
  });
  
  app.controller( 'ratingFormCtrl' , function( $scope ){
	  
	  $scope.selectedPerson = $scope.user.ratedPersonItems[$scope.nextItem.index];
	  
	  $scope.setSelectedPerson = function(){
		  
		  $scope.lis = $( '#formNav' ).find('li');
		 
		  setActive($scope.lis[$scope.nextItem.index]);

 
	  }
	  		
	  $scope.next = function(){

		  saveRating( $scope );
		  
		  if( $scope.nextItem.index < $scope.user.ratedPersonItems.length - 1 ){
			  
			  $scope.nextItem.index++;
			  $scope.selectedPerson = $scope.user.ratedPersonItems[$scope.nextItem.index];
			  //getRating( $scope );
			  
			  if( $scope.nextItem.index == $scope.user.ratedPersonItems.length - 1 ){
				  $scope.nextText = "save";
			  }else{
				  $scope.showBack = true;
				  $scope.nextText = "next";
			  }
			  
			  setActive($scope.lis[$scope.nextItem.index],$scope.lis[$scope.nextItem.index-1]);

		  }
	  };
	  $scope.back = function(){
		  
		  saveRating( $scope );
		  $scope.nextText = "next"; 
		  $scope.nextItem.index--;
		  $scope.selectedPerson = $scope.user.ratedPersonItems[$scope.nextItem.index];
		  //getRating( $scope );
		  
		  $scope.showBack = ($scope.nextItem.index > 0);
		  
		  setActive($scope.lis[$scope.nextItem.index],$scope.lis[$scope.nextItem.index+1]);

	  };	
						  
	  $scope.updatePerson = function(newPerson){
		  
		  saveRating( $scope );
		  							  
		  $scope.selectedPerson = newPerson; 
		  
		  var oldIndex = $scope.nextItem.index;						  
		  var notFound = true;
		  var next = 0;
		  while( notFound && next < $scope.user.ratedPersonItems.length ){
			  if( $scope.selectedPerson.id == $scope.user.ratedPersonItems[next].id ){
				notFound = false; 
				$scope.nextItem.index = next;
			  }else{
				next++;
			  }
		  }
		  
	  	  $scope.showBack = (next > 0);
		  
		  if( next == $scope.user.ratedPersonItems.length - 1 ){
			  $scope.nextText = "save";
		  }else{
			  $scope.nextText = "next";
		  }
		  
		  //set related element to active
		  setActive($scope.lis[$scope.nextItem.index],$scope.lis[oldIndex]);
 
	  };

  });
  
  function setActive( newElem , oldElem ){
	  
	  if( angular.isDefined( oldElem ) ){
	    angular.element(oldElem).removeClass( 'active' );
	  }
	  angular.element(newElem).addClass( 'active' );
  }
 
  function saveRating( $scope ){
  
	  //Send form to server
	  if( !$scope.ratingClosed ){
		  
	  }
	  
  }
    
  app.directive('modal', function () {
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
  });

  app.directive('bsActiveLink', ['$location', function ($location) {
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
  
  // I invoke the given expression when associated ngRepeat loop
  // has finished its first round of rendering.
  app.directive(
	"repeatComplete",
	function( $rootScope ) {
	  // Because we can have multiple ng-repeat directives in
	  // the same container, we need a way to differentiate
	  // the different sets of elements. We'll add a unique ID
	  // to each set.
	  var uuid = 0;
	  // I compile the DOM node before it is linked by the
	  // ng-repeat directive.
	  function compile( tElement, tAttributes ) {
		// Get the unique ID that we'll be using for this
		// particular instance of the directive.
		var id = ++uuid;
		// Add the unique ID so we know how to query for
		// DOM elements during the digests.
		tElement.attr( "repeat-complete-id", id );
		// Since this directive doesn't have a linking phase,
		// remove it from the DOM node.
		tElement.removeAttr( "repeat-complete" );
		// Keep track of the expression we're going to
		// invoke once the ng-repeat has finished
		// rendering.
		var completeExpression = tAttributes.repeatComplete;
		// Get the element that contains the list. We'll
		// use this element as the launch point for our
		// DOM search query.
		var parent = tElement.parent();
		// Get the scope associated with the parent - we
		// want to get as close to the ngRepeat so that our
		// watcher will automatically unbind as soon as the
		// parent scope is destroyed.
		var parentScope = ( parent.scope() || $rootScope );
		// Since we are outside of the ng-repeat directive,
		// we'll have to check the state of the DOM during
		// each $digest phase; BUT, we only need to do this
		// once, so save a referene to the un-watcher.
		var unbindWatcher = parentScope.$watch(
		  function() {
			console.info( "Digest running." );
			// Now that we're in a digest, check to see
			// if there are any ngRepeat items being
			// rendered. Since we want to know when the
			// list has completed, we only need the last
			// one we can find.
			var lastItem = parent.children( "*[ repeat-complete-id = '" + id + "' ]:last" );
			// If no items have been rendered yet, stop.
			if ( ! lastItem.length ) {
			  return;
			}
			// Get the local ng-repeat scope for the item.
			var itemScope = lastItem.scope();
			// If the item is the "last" item as defined
			// by the ng-repeat directive, then we know
			// that the ng-repeat directive has finished
			// rendering its list (for the first time).
			if ( itemScope.$last ) {
			  // Stop watching for changes - we only
			  // care about the first complete rendering.
			  unbindWatcher();
			  // Invoke the callback.
			  itemScope.$eval( completeExpression );
			}
		  });
	  }
	  // Return the directive configuration. It's important
	  // that this compiles before the ngRepeat directive
	  // compiles the DOM node.
	  return({
		compile: compile,
		priority: 1001,
		restrict: "A"
	  });
	}
  );
		

