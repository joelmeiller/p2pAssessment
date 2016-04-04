angular
.module('ipApp')
.factory('SelfDataService', function( $http, $q) {
	
	var deffered = $q.defer();
	var service = {};
	
	//*****************
	//Public Attributes
	//*****************
	var teamMemberItems = [];	
	var next = { text: "next" , available: true };	
	var back = { text: "back" , available: false };
	var selection = { next: next, back: back, index: 0 };
	
	service.ratedTeamMemberItems = function(){ return teamMemberItems };
	service.selection = function() { return selection };
	
	service.clear = function(){
		teamMemberItems = [];
	}
		
	//Load TeamMember Data		
	service.loadTeamMemberList = function(user){
		
		teamMemberItems = [];
		
		$http({
			url: 'php/getRatingListByUser.json',
			method: 'POST',
			data: { userid: user.id }
		}) 
		.success(function(response){
						
			teamMemberItems = response.ratedTeamMemberItems;
						
			deffered.resolve(teamMemberItems);
			
		})
		.error(function(msg, code){
			
			console.log( msg + " / " + code );
			deffered.reject(msg);
			
		});
		
		return deffered.promise;
	}	
	
	function saveRating( user, member  ){
		$http({
			url: 'php/saveRating.json',
			method: 'POST',
			data: { userid: user.id, member: member}
		}) 

	}

	service.saveAndGetNext = function( user, member ){
	  
	  saveRating( user, member );
	  
	  if( selection.index < teamMemberItems.length - 1 ){
		  
		  selection.index++;
		  		  
		  if( selection.index == teamMemberItems.length - 1 ){
			  selection.next.text = "save";
			  selection.next.available = !user.options.rating.closed;
		  }else{
			  selection.back.available = true;
		      selection.next.available = true;
			  selection.next.text = "next";
		  }
		  
	  }	
	  return selection; 
	}
	
	service.saveAndGetPrevious = function( user, member ){
	  
	  saveRating( user, member );
	  
	  selection.next.text = "next";
	  selection.index--;
	  selection.back.available = (selection.index > 0);
	  selection.next.available = true;
	  
	  return selection; 
	}
	
	service.saveAndGetById = function( user, member, id ){
	  
	  saveRating( user, member );	
		
	  var notFound = true;
	  var next = 0;
	  while( notFound && next < teamMemberItems.length ){
		  if( id == teamMemberItems[next].id ){
			notFound = false; 
			selection.index = next;
		  }else{
			next++;
		  }
	  }
	  
	  selection.back.available = (next > 0);
	  
	  if( next == teamMemberItems.length - 1 ){
		  selection.next.text = "save";
		  selection.next.available = !user.options.rating.closed;
	  }else{
		  selection.next.text = "next";
		  selection.next.available = true;
	  }
	  
	  return selection;
	}
	
	service.validateRating = function(){
		  
	  var invalidMembers = [];
	  var memberIndex = 0;

	  var validation = { isValid: true , text:  "Die Bewertung ist abgeschlossen" , type: "success" } ;

  
	  //Iteration over all team members
	  while( memberIndex < teamMemberItems.length ){
		
		var critIndex = 0;
		var valid = true;
		var ratedMember = teamMemberItems[memberIndex]
		
		//Iteration over all ratings per team member (as long as they exists)
		while( valid && critIndex < ratedMember.criteriaItems.length ){
		
		   if( angular.isUndefined( ratedMember.criteriaItems[ critIndex ].rating ) ){
			  invalidMembers.push( ratedMember.name );
			  validation.isValid = valid = false; 
		   }
		   critIndex++;
		}
		memberIndex++;
	  }
							  
	  if( validation.isValid ){
		
		selection.next.available = false;  
		  
	  }else{

		validation.text = "Das P2P Assessment konnte nicht abgeschlossen werden. Es fehlen Bewertungen für " + invalidMembers[0];
		validation.type = "danger";
		
		for( var i=1; i < invalidMembers.length - 1; i++ ){
		  validation.text += ", " + invalidMembers[i];
		}
		if( invalidMembers.length > 1 ){
		  validation.text += " und " + invalidMembers[invalidMembers.length - 1];
		}
		validation.text += ".";
	  }
	  
	  return validation;
	
	}
	
	function saveRating(member){
		
		//Save rating
		angular.forEach( member.criteria, function( crit, index ){
		
			teamMemberItems[index].rating = crit.rating;
			teamMemberItems[index].comment = crit.comment;
			
		});

		//ToDo: save Rating in Backend
		
	}
	
	return service;
	

})