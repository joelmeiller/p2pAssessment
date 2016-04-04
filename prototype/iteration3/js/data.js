angular.module( 'ipApp.data', [
  'ui.router'/*,
  'angular-storage',
  'angular-jwt'*/
])
.config(function($stateProvider) {
	
  $stateProvider
 	
	// Overview
	.state('overview', {
		url: '/',
		abstract: true,
		controller: 'DataCtrl',
		templateUrl: 'tmpl/qualitymanager/overview.html',
		data: {
			requiresLogin: true
		  }
	})
	
	.state('overview.byCriteria', {
		url: '/byCriteria',
		views: {
		'detailView@overview' : {
			templateUrl: 'tmpl/qualitymanager/overviewByCriteria.html'
		  }
		}
	})

	.state('overview.byTeamMember', {
		url: '/byTeamMember',
		views: {
		'detailView@overview' : {
			templateUrl: 'tmpl/qualitymanager/overviewByTeamMember.html'
		  }
		}
	})
	
	// Modify View
	.state('modify', {
		url: '/modify',
		abstract: true,
		controller: 'DataCtrl',
		data: {
			requiresLogin: true
		  }
	})
	
	
	.state('overview.modifyCriteria', {
		url: '/modifyCriteria',
		views: {
		'detailView@overview' : {
			templateUrl: 'tmpl/qualitymanager/modifyCriteria.html'
		  }
		}
	})

	.state('overview.modifyTeamMember', {
		url: '/modifyTeamMember',
		views: {
		'detailView@overview' : {
			templateUrl: 'tmpl/qualitymanager/modifyTeamMember.html'
		  }
		}
	});

})
.controller( 'DataCtrl', function( $rootScope, $scope /*, store, jwtHelper)*/, $state, DataService, $modal  ) {

  /*$scope.jwt = store.get('jwt');*/  
  $scope.ratingReferenceItems = DataService.ratingReferenceItems();
  $scope.criteriaItems = DataService.criteriaItems();
  $scope.teamMemberItems = DataService.teamMemberItems();
  $scope.filterId = "";
  
  $scope.newCriteria = {};
  $scope.newTeamMember = {};
    
  if( $scope.criteriaItems.length == 0 || $scope.teamMemberItems.length ){
	DataService.loadCriteria()
	.then(function(data){
		
		$scope.criteriaItems = data.criteriaItems;
		$scope.ratingReferenceItems = data.ratingReferenceItems ;
		
		DataService.loadTeamMemberList($rootScope.user)
		.then(function(teamMemberItems){
			 $scope.teamMemberItems = teamMemberItems;
		});
	});
  }
    
  $scope.toggleFilter = function( id ){
    if( angular.equals( id, $scope.filterId ) ){
	  $scope.filterId = "";
	}else{
	  $scope.filterId = id;  
	}
  }
  
  $scope.editCriteria = function (index) {
	  
	  $scope.editIndex = index;  
  	  
	  var size = 'lg';
  
	  var modalInstance = $modal.open({
		templateUrl: 'criteriaModal.html',
		controller: 'criteriaModalCtrl',
		size: size,
		resolve: {
		  items: function() {
		    return $scope.ratingReferenceItems;
		  },
		  editCriteria: function() {
			return DataService.editCriteria(index);
		  }
		}
	  });
  
	  modalInstance.result.then(function (crit) {
		  if( DataService.saveCriteria($rootScope.user,crit, $scope.editIndex)){
		     $scope.criteriaItems = DataService.criteriaItems();  
	  	  };
	  });
  
  }
  
  $scope.addCriteria = function(){
	  if( DataService.saveCriteria($rootScope.user, $scope.newCriteria) ){
		  $scope.criteriaItems = DataService.criteriaItems();  
		  $scope.newCriteria = {};
	  };  
  }
  
  $scope.deleteCriteria = function(index){
  	  $scope.criteriaItems = DataService.deleteCriteria($rootScope.user, index);
  }
  
  $scope.editTeamMember = function (index) {
	  
	  $scope.editIndex = index;  
  	  
	  var size = 'lg';
  
	  var modalInstance = $modal.open({
		templateUrl: 'teamMemberModal.html',
		controller: 'teamMemberModalCtrl',
		size: size,
		resolve: {
		  editTeamMember: function() {
			return DataService.editTeamMember(index);
		  }
		}
	  });
  
	  modalInstance.result.then(function (member) {
		  if( DataService.saveTeamMember($rootScope.user,member, $scope.editIndex)){
		     $scope.teamMemberItems = DataService.teamMemberItems();  
	  	  };
	  });
  
  }
  
  $scope.addTeamMember = function(){
	  if( DataService.saveTeamMember($rootScope.user, $scope.newTeamMember) ){
		  $scope.teamMemberItems = DataService.teamMemberItems();  
		  $scope.newTeamMember = {};
	  };  
  }
  
  $scope.deleteTeamMember = function(index){
  	  $scope.teamMemberItems = DataService.deleteTeamMember($rootScope.user, index);
  }
  
  $scope.resetTeamMemberLogin = function(index){
  	  DataService.resetTeamMemberLogin(index);
  }

  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {	
  
		$scope.filterId = "";
		
		if( toState.name == 'overview.modifyCriteria'
		 || toState.name == 'overview.modifyTeamMember' ){
		   $scope.showOverview = false;		   
  		}else{
		   $scope.showOverview = true;
		}
 
  });
 
})
.controller('criteriaModalCtrl', function ($scope, $modalInstance, items, editCriteria) {

  $scope.items = items;
  $scope.editCriteria = editCriteria;

  $scope.save = function () {
    $modalInstance.close($scope.editCriteria);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
.controller('teamMemberModalCtrl', function ($scope, $modalInstance, editTeamMember) {

  $scope.editTeamMember = editTeamMember;

  $scope.save = function () {
    $modalInstance.close($scope.editTeamMember);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})
.filter('ratingFilter', function() {
  return function(items) {
	  
	var filteredItems = [];
	  
    for (var i = 0; i < items.length; i++) {
       if( ( Math.abs( items[i].value ) % 2 ) != 1 ){
	     filteredItems.push( items[i] );
	   }
    }
    return filteredItems;
  };
})

