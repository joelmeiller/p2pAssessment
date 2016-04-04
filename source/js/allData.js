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
			  
		  .state('overview.byCriteriaChart', {
			  url: 'criteriaChart',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/overviewByCriteriaChart.html'
				}
			  }
		  })
	  
		  .state('overview.byTeammemberChart', {
			  url: 'teawmmemberChart',
			  views: {
			  'detailView@overview' : {
				  templateUrl: 'tmpl/qualitymanager/overviewByTeammemberChart.html'
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
	  /*.run(function($rootScope) {
		  				  
		  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, $scope) {	

		  		if( toState.name == "overview.byTeammemberChart" || toState.name == "overview.byCriteriaChart" ){
		  		  				//Add canvas
				  //for( c=0; c < $scope.criteriaItems.length; c++ ){
				  for( c=0; c < 1; c++ ){
					  
					  
					  var canvas = $( '#chart' );
					  var canvas2 = document.getElementById( 'chart' );
					  console.log(canvas);
					  console.log(canvas2);
					  //canvas.attr( "id" , "chart_" + $scope.criteriaItems[c].id );
					  
					  var ctx = canvas.getContext("2d");
					  
					  //var ctx = $( '#chart_' + $scope.criteriaItems[c].id  ).getContext("2d");
					  //var ctx = document.getElementById("chart_' + $scope.criteriaItems[c].id").getContext("2d");
					  //ctx = ( '#chart_' + criteriaItems[c].id ).get(0).
					  //var newChart = new Chart(ctx).Bar(AllDataService.barChartData($rootScope.isCriteriaView, id), options);
			  
				  }

				}
		 
		  });
		  
	  })*/
	  .controller( 'AllDataCtrl', function( $rootScope, $scope, $state, AllDataService, $modal  ) {
	  
		/*$scope.jwt = store.get('jwt');*/  
		$scope.ratingReferenceItems = AllDataService.ratingReferenceItems();
		$scope.criteriaItems = AllDataService.criteriaItems();
		
		$scope.newCriteria = {};
		$scope.newTeammember = {};
		
		//Control variables for graphical and table views
		$scope.isTableView = true;		
		 
		var options = {
			
		  //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		  scaleBeginAtZero : false,
	  
		  //Boolean - Whether grid lines are shown across the chart
		  scaleShowGridLines : true,
	  
		  //String - Colour of the grid lines
		  scaleGridLineColor : "rgba(0,0,0,.05)",
	  
		  //Number - Width of the grid lines
		  scaleGridLineWidth : 1,
	  
		  //Boolean - Whether to show horizontal lines (except X axis)
		  scaleShowHorizontalLines: true,
	  
		  //Boolean - Whether to show vertical lines (except Y axis)
		  scaleShowVerticalLines: true,
	  
		  //Boolean - If there is a stroke on each bar
		  barShowStroke : true,
	  
		  //Number - Pixel width of the bar stroke
		  barStrokeWidth : 2,
	  
		  //Number - Spacing between each of the X value sets
		  barValueSpacing : 5,
	  
		  //Number - Spacing between data sets within X values
		  barDatasetSpacing : 1,
			
		}
		  
		//Get data from server  
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
	  
		//Initialize and setup filter  
		$scope.filterId = "";
		$scope.toggleFilter = function( id ){
		  if( angular.equals( id, $scope.filterId ) ){
			$scope.filterId = "";
		  }else{
			$scope.filterId = id;  
		  }
		}
		
		//Overview functions
		$scope.switchOverview = function(){
			
			$scope.isTableView = !$scope.isTableView;
						
			if( $scope.isTableView ){
				if( $rootScope.isCriteriaView ){
					$state.go('overview.byCriteria');
				}else{					
					$state.go('overview.byTeammember');
				}
			}else{
				if( $rootScope.isCriteriaView ){
					$state.go('overview.byCriteriaChart');
				}else{					
					$state.go('overview.byTeammemberChart');
				}
				
			}
		}
		
		$scope.$on('$viewContentLoaded', function(event) {	

			console.log("Content loaded:" + $scope.isTableView);
			
			if( !$scope.isTableView ){
					
				var ctx = $( '#chart' ).get(0).getContext( "2d");
				
				console.log(ctx);
				
				
				var myBarChart = new Chart(ctx).Bar(AllDataService.barChartData($rootScope.isCrtieriaView, 0), options);

			}
		});
		
		
		//Modifier functions
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
		  var pwdEncrypted = md5($scope.pwd);
		  $scope.pwd = "";
		  $scope.repeatPwd = "";
		  $modalInstance.close(pwdEncrypted);
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


