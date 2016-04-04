angular.module( 'ipApp.allData', [
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
		controller: 'AllDataCtrl',
		templateUrl: 'tmpl/qualitymanager/overview.html',
		data: {
			requiresLogin: true
		  }
	})
	
	// All users
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
		
	// Modify
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
.controller( 'AllDataCtrl', function( $rootScope, $scope /*, store, jwtHelper)*/, $state, AllDataService, $modal  ) {

  /*$scope.jwt = store.get('jwt');*/  
  $scope.ratingReferenceItems = AllDataService.ratingReferenceItems();
  $scope.criteriaItems = AllDataService.criteriaItems();
  $scope.teamMemberItems = AllDataService.teamMemberItems();
  $scope.filterId = "";
  
  $scope.newCriteria = {};
  $scope.newTeamMember = {};
    
  if( $scope.criteriaItems.length == 0 ){
	AllDataService.loadCriteria()
	.then(function(data){
		
		$scope.criteriaItems = data.criteriaItems;
		$scope.ratingReferenceItems = data.ratingReferenceItems ;
		
	});
  }

  if( $scope.teamMemberItems.length == 0 ){
	AllDataService.loadTeamMemberList($rootScope.user)
	.then(function(teamMemberItems){
		 $scope.teamMemberItems = teamMemberItems;
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
			return AllDataService.editCriteria(index);
		  }
		}
	  });
  
	  modalInstance.result.then(function (crit) {
		  if( AllDataService.saveCriteria($rootScope.user,crit, $scope.editIndex)){
		     $scope.criteriaItems = AllDataService.criteriaItems();  
	  	  };
	  });
  
  }
  
  $scope.addCriteria = function(){
	  if( AllDataService.saveCriteria($rootScope.user, $scope.newCriteria) ){
		  $scope.criteriaItems = AllDataService.criteriaItems();  
		  $scope.newCriteria = {};
	  };  
  }
  
  $scope.deleteCriteria = function(index){
  	  $scope.criteriaItems = AllDataService.deleteCriteria($rootScope.user, index);
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
			return AllDataService.editTeamMember(index);
		  }
		}
	  });
  
	  modalInstance.result.then(function (member) {
		  if( AllDataService.saveTeamMember($rootScope.user,member, $scope.editIndex)){
		     $scope.teamMemberItems = AllDataService.teamMemberItems();  
	  	  };
	  });
  
  }
  
  $scope.addTeamMember = function(){
	  if( AllDataService.saveTeamMember($rootScope.user, $scope.newTeamMember) ){
		  $scope.teamMemberItems = AllDataService.teamMemberItems();  
		  $scope.newTeamMember = {};
	  };  
  }
  
  $scope.deleteTeamMember = function(index){
  	  $scope.teamMemberItems = AllDataService.deleteTeamMember($rootScope.user, index);
  }
  
  $scope.resetTeamMemberLogin = function(index){
  	  AllDataService.resetTeamMemberLogin(index);
  }

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

