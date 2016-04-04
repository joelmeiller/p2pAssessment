
  var app = angular.module('ipApp', ['ui.bootstrap']);
  app.controller( 'ipController', function($scope,$http) {
	  
	  $scope.showLogin = true;
	  $scope.showContent = false;			  

	  $scope.login = function(){
		  
		  $scope.showLogin = false;
		  $scope.showContent = true;
		  
		  $http.get("data/criteria.json")
			  .success(function(response) {
							
				  $scope.data = response;
				  $scope.overviewText = "Übersicht";
				  $scope.backText = "back";
				  $scope.nextText = "next";
				  $scope.nextIndex = 0;
				  
				  $scope.overview = true;
				  $scope.showOverview = true;
				  $scope.showRatingForm = false;
				  $scope.showBack = false;
	
				  //$scope.person = $scope.data.user.ratedPersons[$scope.nextIndex];
			  
				  //getRating( $scope );
	
	
				  $scope.next = function(){
					  
					  saveRating( $scope );
					  
					  if( $scope.nextIndex < $scope.data.user.ratedPersons.length - 1 ){
						  
						  $scope.nextIndex++;
						  $scope.person = $scope.data.user.ratedPersons[$scope.nextIndex];
						  getRating( $scope );
						  
						  if( $scope.nextIndex == $scope.data.user.ratedPersons.length - 1 ){
							  $scope.nextText = "save";
						  }else{
							  $scope.showBack = true;
							  $scope.nextText = "next";
						  }
					  }
				  };
				  $scope.back = function(){
					  
					  saveRating( $scope );
					  $scope.nextText = "next"; 
					  $scope.nextIndex--;
					  $scope.person = $scope.data.user.ratedPersons[$scope.nextIndex];
					  getRating( $scope );
					  
					  $scope.showBack = ($scope.nextIndex > 0);
				  };	
				  
				  $scope.updatePerson = function(newPerson){
					  
					  if( $scope.person ){
					  	  saveRating( $scope );	  
					  }
				  
					  $scope.person = newPerson; 
					  
					  getRating( $scope );
					  
					  var notFound = true;
					  var next = 0;
					  while( notFound && next < $scope.data.user.ratedPersons.length ){
						  if( $scope.person.id == $scope.data.user.ratedPersons[next].id ){
							notFound = false; 
						  }else{
							next++;
						  }
					  }
					  $scope.nextIndex = next;
					  $scope.showBack = (next > 0);
					  
					  if( next == $scope.data.user.ratedPersons.length - 1 ){
						  $scope.nextText = "save";
					  }else{
						  $scope.nextText = "next";
					  }
					  
					  if( $scope.showOverview ){
						  $scope.showOverview = false;
						  $scope.showRatingForm = true;
						  $scope.overview = false;					  
					  }
				  };
				  
				  $scope.toggleOverview = function(){
					  $scope.showOverview = !($scope.showOverview);
					  $scope.showRatingForm = !($scope.showRatingForm);
				  };
			 });
		  
	  }
			  
	 	  
  });
  
  function saveRating( $scope ){
  
	  for( var i = 0; i < $scope.data.criteria.length; i++){
						  
		  $scope.person.criteria[i].rating = $scope.data.criteria[i].selected.rating.value ;					
		  $scope.person.criteria[i].comment = $scope.data.criteria[i].comment;
	  };
	  
  }
  
  function getRating( $scope ){
				  
	  for( var i = 0; i < $scope.data.criteria.length; i++){
		  
		  var notFound = true
		  var next = 0;
		  
		  while( notFound && next < $scope.data.criteria[i].ratings.length ){
			  
			  if( $scope.data.criteria[i].ratings[next].value == $scope.person.criteria[i].rating  ){
				  $scope.data.criteria[i].selected = { rating: $scope.data.criteria[i].ratings[next] }
				  notFound = false;
			  }
			  next++;
		  }
		  
		  if( notFound ){
			  $scope.data.criteria[i].selected = { rating: $scope.data.criteria[i].ratings[next] }
		  }
		  
		  $scope.data.criteria[i].comment = $scope.person.criteria[i].comment;
		  
	  }
  };
  
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
		

