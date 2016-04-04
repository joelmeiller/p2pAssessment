
    var dependencies = [
			'jquery',
			'bootstrap',
			'angular',
			'angularUIBootstrap',
			'angularUIBootstrapTpls',			
			
			'selfDataService',
			'allDataService'
    ];
 
    define( dependencies, function( $rootScope
	                              , $scope
								  , $stateProvider
								  , AllDataService
								  , SelfDataService
								  )
    {
	  angular
	  .module( 'ipApp.selfData', [
		'ui.router'
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
			  url: 'byCriteriaSelf',
			  views: {
			  'detailView@selfOverview' : {
				  templateUrl: 'tmpl/teammember/overviewByCriteria.html'
				}
			  }
		  })
	  
		  .state('selfOverview.byTeammember', {
			  url: 'byTeammemberSelf',
			  views: {
			  'detailView@selfOverview' : {
				  templateUrl: 'tmpl/teammember/overviewByTeammember.html'
				}
			  }
		  })
		  
		  // Rating Form
		  .state('ratingForm', {
			  url: 'ratingForm',
			  controller: 'SelfDataCtrl',
			  templateUrl: 'tmpl/teammember/ratingForm.html',
			  data: {
				  requiresLogin: true
				}
	  
		  })
	  
		  
	  })
	  .controller( 'SelfDataCtrl', function( $rootScope, $scope , $state, AllDataService, SelfDataService  ) {
	  
		/*$scope.jwt = store.get('jwt');*/  
		$scope.ratingReferenceItems = AllDataService.ratingReferenceItems();
		$scope.criteriaItems = AllDataService.criteriaItems();
		
		$scope.teammemberRatingItems = SelfDataService.teammemberRatingItems();
		
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
		if( $scope.teammemberRatingItems.length == 0 ){
		  SelfDataService.loadTeammemberList($rootScope.user)
		  .then(function(teammemberItems){
			   $scope.teammemberRatingItems = teammemberItems;
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
			 $scope.selectedItem = $scope.teammemberRatingItems[$scope.selection.index];
			 $scope.selectedItem.active = "active";
	  
		}
		
		$rootScope.closeUserRating = function(){
			
			if( angular.isDefined($scope.infoItem)){
			  var index = $scope.infoItems.indexOf($scope.infoItem);
			  if (index != -1) {
				 $rootScope.infoItems.splice(index, 1);
			  }
			}
	  
			$scope.infoItem = SelfDataService.validateRating($rootScope.user);
				
			$rootScope.infoItems.push( $scope.infoItem );
			$rootScope.user.options.rating.closed = $scope.infoItem.isValid;
			
			$scope.selection = SelfDataService.selection();
		};
		
	  })
	  
	});
	