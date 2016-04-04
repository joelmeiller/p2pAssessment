(function() 
{
    var dependencies = [
			'jquery',
			'bootstrap',
			'angular',
			'angularUIBootstrap',
			'angularUIBootstrapTpls',			
			
			'allDataService'
    ];
 
    define( dependencies, function( $rootScope
	                              , $scope
								  , $stateProvider
								  , AllDataService
								  , $modal
								  )
    {
	  angular
	  .module( 'ipApp.allData', [
		  'ui.router'
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
			  url: 'byCriteria',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/overviewByCriteria.html'
				}
			  }
		  })
	  
		  .state('overview.byTeammember', {
			  url: 'byTeammember',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/overviewByTeammember.html'
				}
			  }
		  })
			  
		  // Modify
		  .state('overview.modifyCriteria', {
			  url: 'modifyCriteria',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/modifyCriteria.html'
				}
			  }
		  })
	  
		  .state('overview.modifyTeammember', {
			  url: 'modifyTeammember',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/modifyTeammember.html'
				}
			  }
		  });
	  
	  })
	  .controller( 'AllDataCtrl', function( $rootScope, $scope, $state, AllDataService, $modal  ) {
	  
		/*$scope.jwt = store.get('jwt');*/  
		$scope.ratingReferenceItems = AllDataService.ratingReferenceItems();
		$scope.criteriaItems = AllDataService.criteriaItems();
		
		$scope.newCriteria = {};
		$scope.newTeammember = {};
		  
		if( $scope.criteriaItems.length == 0 ){
		  AllDataService.loadCriteria()
		  .then(function(data){
			  
			  $scope.criteriaItems = data.criteriaItems;
			  $scope.ratingReferenceItems = data.ratingReferenceItems ;
			  
		  });
		}
	  
		$scope.teammemberItems = AllDataService.teammemberItems();
		if( $scope.teammemberItems.length == 0 ){
		  AllDataService.loadTeammemberList($rootScope.user)
		  .then(function(teammemberItems){
			   $scope.teammemberItems = teammemberItems;
		  });
		}
	  
		  
		$scope.filterId = "";
		$scope.toggleFilter = function( id ){
		  if( angular.equals( id, $scope.filterId ) ){
			$scope.filterId = "";
		  }else{
			$scope.filterId = id;  
		  }
		}
		
		$scope.editCriteria = function (index) {
			
			$scope.editIndex = index;  
			
			var modalInstance = $modal.open({
			  templateUrl: 'criteriaModal.html',
			  controller: 'criteriaModalCtrl',
			  size: 'lg',
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
		
		/*$scope.$watch('user.options.rating.openForAll',function(){
			console.log("change rating option");
			if( angular.isDefined($scope.user.options) ){
			  AllDataService.saveRatingOption( $scope.user );
			}
		});*/
		$scope.updateRatingOption = function(){
			if( angular.isDefined($scope.user.options) ){
			  AllDataService.saveRatingOption( $scope.user );
			}
		};
		
		$scope.editTeammember = function (index) {
			
			$scope.editIndex = index;  
			
			var modalInstance = $modal.open({
			  templateUrl: 'teammemberModal.html',
			  controller: 'teammemberModalCtrl',
			  size: 'lg',
			  resolve: {
				editTeammember: function() {
				  return AllDataService.editTeammember(index);
				}
			  }
			});
		
			modalInstance.result.then(function (member) {
				if( AllDataService.saveTeammember($rootScope.user,member, $scope.editIndex)){
				   $scope.teammemberItems = AllDataService.teammemberItems();  
				};
			});
		
		}
		
		$scope.addTeammember = function(){
			
			var modalInstance = $modal.open({
			  templateUrl: 'passwordModal.html',
			  controller: 'passwordModalCtrl',
			  size: 'lg',
			  resolve: {
				name: function() {
				  return $scope.newTeammember.username;
				}
			  }
			});
		
			modalInstance.result.then(function (pwd) {
				
				$scope.newTeammember.password = pwd;
				
				if( AllDataService.saveTeammember($rootScope.user, $scope.newTeammember) ){
					$scope.teammemberItems = AllDataService.teammemberItems();  
					$scope.newTeammember = {};
				};  
			});
			
			
/*			if( AllDataService.saveTeammember($rootScope.user, $scope.newTeammember) ){
				$scope.teammemberItems = AllDataService.teammemberItems();  
				$scope.newTeammember = {};
			};  
*/		}
		
		$scope.addTeammemberPassword = function () {
			
		
		}
		
		$scope.deleteTeammember = function(index){
			$scope.teammemberItems = AllDataService.deleteTeammember($rootScope.user, index);
		}
		
		$scope.resetTeammemberLogin = function(index){
			AllDataService.resetTeammemberLogin(index);
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
	  .controller('teammemberModalCtrl', function ($scope, $modalInstance, editTeammember) {
	  
		$scope.editTeammember = editTeammember;
	  
		$scope.save = function () {
		  $modalInstance.close($scope.editTeammember);
		};
	  
		$scope.cancel = function () {
		  $modalInstance.dismiss('cancel');
		};
	  })
	  .controller('passwordModalCtrl', function ($scope, $modalInstance, name) {
	  
		$scope.name = name;
		
		$scope.pwd = "";
		$scope.repeatPwd = "";
	  	$scope.pwdNok = true;
	  
		$scope.save = function () {
		  $modalInstance.close($scope.pwd);
		};
	  
		$scope.cancel = function () {
		  $modalInstance.dismiss('cancel');
		};
		
		$scope.checkPassword = function(){
			$scope.pwdNok = !( $scope.pwd != "" && $scope.pwd == $scope.repeatPwd );			
		}
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
	});
})();

