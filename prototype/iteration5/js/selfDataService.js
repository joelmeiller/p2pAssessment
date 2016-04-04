 define( function() 
{
	function SelfDataService( $http, $q , store )
	{

	  var requestUrl = 'php/RequestHandler';
	  var deffered = $q.defer();
	  var service = {};
	  
	  //*****************
	  //Public Attributes
	  //*****************
	  var teammemberItems = [];	
	  var next = { text: "next" , available: true };	
	  var back = { text: "back" , available: false };
	  var selection = { next: next, back: back, index: 0 };
	  
	  service.teammemberRatingItems = function(){ return teammemberItems };
	  service.selection = function() { return selection };
	  
	  service.clear = function(){
		  teammemberItems = [];
	  }
		  
	  //Load Teammember Data		
	  service.loadTeammemberList = function(user){
		  
		  teammemberItems = [];
		  
		  $http({
			  url: requestUrl,
			  method: 'POST',
			  data: { operation : 'GetRatingListByUser' , token: store.get('jwt')  }
		  }) 
		  .success(function(response){
						  
			  teammemberItems = response.teammemberItems;
						  
			  deffered.resolve(teammemberItems);
			  
		  })
		  .error(function(msg, code){
			  
			  console.log( msg + " / " + code );
			  deffered.reject(msg);
			  
		  });
		  
		  return deffered.promise;
	  }	
	  
	  
  
	  service.saveAndGetNext = function( user, member ){
		
		saveRating( user, member );
		
		if( selection.index < teammemberItems.length - 1 ){
			
			selection.index++;
					
			if( selection.index == teammemberItems.length - 1 ){
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
		while( notFound && next < teammemberItems.length ){
			if( id == teammemberItems[next].id ){
			  notFound = false; 
			  selection.index = next;
			}else{
			  next++;
			}
		}
		
		selection.back.available = (next > 0);
		
		if( next == teammemberItems.length - 1 ){
			selection.next.text = "save";
			selection.next.available = !user.options.rating.closed;
		}else{
			selection.next.text = "next";
			selection.next.available = true;
		}
		
		return selection;
	  }
	  
	  service.validateRating = function(user){
			
		var invalidMembers = [];
		var memberIndex = 0;
  
		var validation = { isValid: true , text:  "Die Bewertung ist abgeschlossen" , type: "success" } ;
  
	
		//Iteration over all team members
		while( memberIndex < teammemberItems.length ){
		  
		  var critIndex = 0;
		  var valid = true;
		  var ratedMember = teammemberItems[memberIndex]
		  
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
			
		  
		  $http({
			url: requestUrl,
			method: 'POST',
			data: { operation : 'CloseRating' , token: store.get('jwt') }
		  })	
  
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
	  
	  function saveRating( user, member){
		  
		  //Save rating
		  angular.forEach( member.criteria, function( crit, index ){
		  
			  teammemberItems[index].rating = crit.rating;
			  teammemberItems[index].comment = crit.comment;
			  
		  });
  
		  $http({
			url: requestUrl,
			method: 'POST',
			data: { operation : 'UpdateRating' , token: store.get('jwt')  , teammember: member }
		  })	
	  }
		  
	  return service;
	  
	};
	
	SelfDataService.$inject = ['$http','$q','store'];
	
	return SelfDataService;
	  
})
