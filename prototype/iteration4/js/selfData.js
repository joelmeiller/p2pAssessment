angular.module( 'ipApp.selfData', [
  'ui.router'/*,
  'angular-storage',
  'angular-jwt'*/
])
.config(function($stateProvider) {
	
  $stateProvider
  
  	// User Overview 
	.state('selfOverview', {
		url: '/',
		abstract: true,
		controller: 'SelfDataCtrl',
		templateUrl: 'tmpl/teammember/overview.html',
		data: {
			requiresLogin: true
		  }
	})
	
	// Self
	.state('selfOverview.byCriteria', {
		url: '/byCriteria',
		views: {
		'detailView@selfOverview' : {
			templateUrl: 'tmpl/teammember/overviewByCriteria.html'
		  }
		}
	})

	.state('selfOverview.byTeamMember', {
		url: '/byTeamMember',
		views: {
		'detailView@selfOverview' : {
			templateUrl: 'tmpl/teammember/overviewByTeamMember.html'
		  }
		}
	})
	
	// Rating Form
	.state('ratingForm', {
		url: '/ratingForm',
		controller: 'SelfDataCtrl',
		templateUrl: 'tmpl/teammember/ratingForm.html',
		data: {
			requiresLogin: true
		  }

	})

 	
})
.controller( 'SelfDataCtrl', function( $rootScope, $scope /*, store, jwtHelper)*/, $state, AllDataService, SelfDataService  ) {

  /*$scope.jwt = store.get('jwt');*/  
  $scope.ratingReferenceItems = AllDataService.ratingReferenceItems();
  $scope.criteriaItems = AllDataService.criteriaItems();
  
  $scope.ratedTeamMemberItems = SelfDataService.ratedTeamMemberItems();
  
  // Load criteria items (if not alreaday done yet)
  if( $scope.criteriaItems.length == 0 ){
	AllDataService.loadCriteria()
	.then(function(data){
		
		$scope.criteriaItems = data.criteriaItems;
		$scope.ratingReferenceItems = data.ratingReferenceItems ;
		
	});
  }
  
  $scope.selection = SelfDataService.selection();
  $scope.selectedItem = {};

  // Load rated team member items (if not already done yet)
  if( $scope.ratedTeamMemberItems.length == 0 ){
	SelfDataService.loadTeamMemberList($rootScope.user)
	.then(function(teamMemberItems){
		 $scope.ratedTeamMemberItems = teamMemberItems;
		 setSelectedItem();
	});
  }else{
	 setSelectedItem()
  }
  
	
  $scope.next = function(){

	  $scope.selection = SelfDataService.saveAndGetNext( $rootScope.user, $scope.selectedItem );
	  
	  setSelectedItem();
	  
  };
  
  $scope.back = function(){
	  
	  $scope.selection = SelfDataService.saveAndGetPrevious( $rootScope.user, $scope.selectedItem );
	  
	  setSelectedItem();

  }	
					  
  $scope.goTo = function(newMember){
	  
	  $scope.selection = SelfDataService.saveAndGetById( $rootScope.user, $scope.selectedItem , newMember.id );
	  
	  setSelectedItem();

	  
  }
  
  // Special function to set active menu element
  function setSelectedItem(){
	  
	   if( angular.isDefined($scope.selectedItem)){
	       $scope.selectedItem.active = "";
	   }
	   $scope.selectedItem = $scope.ratedTeamMemberItems[$scope.selection.index];
	   $scope.selectedItem.active = "active";

  }
  
  $rootScope.closeUserRating = function(){
	  
	  if( angular.isDefined($scope.infoItem)){
	    var index = $scope.infoItems.indexOf($scope.infoItem);
	    if (index != -1) {
		   $rootScope.infoItems.splice(index, 1);
	    }
	  }

	  $scope.infoItem = SelfDataService.validateRating();
	  	  
	  $rootScope.infoItems.push( $scope.infoItem );
	  $rootScope.user.options.rating.closed = $scope.infoItem.isValid;
	  
	  $scope.selection = SelfDataService.selection();
  };
  
  
})
