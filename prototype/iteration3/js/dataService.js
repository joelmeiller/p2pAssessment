angular
.module('ipApp')
.factory('DataService', function( $http, $q) {
	
	var defferedCrit = $q.defer();
	var defferedMember = $q.defer();
	var service = {};
	
	var template_ratedCriteriaItems = [];

	//*****************
	//Public Attributes
	//*****************
	var criteriaItems = [];
	var ratingReferenceItems = [];
	var teamMemberItems = [];
		
	
	service.criteriaItems = function(){ return criteriaItems };
	service.ratingReferenceItems = function(){ return ratingReferenceItems };
	service.teamMemberItems = function(){ return teamMemberItems };

	//Load Criteria Data
	service.loadCriteria = function(){
		
		criteriaItems = [];
		
		$http({
			url: 'php/getCriteriaList.json',
			method: 'GET'
		}) 
		.success(function(response) {
			
			criteriaItems = response.criteriaItems;
			ratingReferenceItems = response.ratingReferenceItems;	
			
			//Create template ratedCriteria
			for( var c=0; c < criteriaItems.length; c++ ){
				 ratedCriteria = {
					id: criteriaItems[c].id,
					comment: "Noch kein Kommentar",					
				}
				template_ratedCriteriaItems.push( ratedCriteria );
			}
			
		    defferedCrit.resolve( { criteriaItems: criteriaItems , ratingReferenceItems: ratingReferenceItems });
							
		})
		.error(function(msg, code){
			
			console.log( msg + " / " + code );
			
			defferedCrit.reject(msg);
			
		});
		
		return defferedCrit.promise;

	}
		
	//Load TeamMember Data		
	service.loadTeamMemberList = function(user){
		
		teamMemberItems = [];
		
		$http({
			url: 'php/getRatingList.json',
			method: 'POST',
			data: { userid: user.id }
		}) 
		.success(function(response){
						
			teamMemberItems = response.teamMemberItems;
			
			//Get Tooltip
			angular.forEach( teamMemberItems, function( member, m ){
				angular.forEach( member.ratedByTeamMemberItems, function( ratedBy, r ){
					angular.forEach( ratedBy.criteriaItems, function( criteria, c ){
					  criteria.tooltip = "<p><b>" + ratedBy.name + "</b></p>"
									  + "<p>" + criteria.comment + "</p>";
						
					});
				});
			});
			
			defferedMember.resolve(teamMemberItems);
			
		})
		.error(function(msg, code){
			
			console.log( msg + " / " + code );
			defferedMember.reject(msg);
			
		});
		
		return defferedMember.promise;
	}	
	
	service.deleteCriteria = function(user, index){
		
		if( criteriaItems.length > 0 && index < criteriaItems.length ){
			
			$http({
			  url: 'php/deleteCriteria.json',
			  method: 'POST',
			  data: { userid: user.id, criteriaid: criteriaItems[index].id }
		    })  
			   
		 	criteriaItems.splice( index, 1 );
		}
		return criteriaItems;
	}
	
	service.editCriteria = function(index){
		
		var crit = criteriaItems[index];
	
		var copyCrit = {
			topic: crit.topic,
			good: crit.ratingItems[0].description,
			normal: crit.ratingItems[2].description,
			bad: crit.ratingItems[4].description
		}
		
		return copyCrit;

	}
	
	service.saveCriteria = function(user, saveCrit, index){
		
		var added = false;
		
		if( angular.isDefined(index)){
		  var newCrit = criteriaItems[index];
		}else{
		  var newCrit = {};
		  
		  newCrit.ratingItems = [];
		  
		  angular.forEach(ratingReferenceItems, function(rating,index){
			  
		  	newCrit.ratingItems[index] = {
				ref: rating.ref,
		  	    value: rating.value,
		  	    symbol: rating.symbol
			}
		  })
		}
		
		if( angular.isDefined(saveCrit.topic)
		 && angular.isDefined(saveCrit.good) 
		 && angular.isDefined(saveCrit.normal) 
		 && angular.isDefined(saveCrit.bad) ){
			
			newCrit.topic = saveCrit.topic;
			newCrit.ratingItems[0].description = saveCrit.good;
			newCrit.ratingItems[2].description = saveCrit.normal;
			newCrit.ratingItems[4].description = saveCrit.bad;
			
			if(angular.isDefined(index)){

				$http({
				  url: 'php/saveCriteria.json',
				  method: 'POST',
				  data: { userid: user.id, criteriaid: newCrit.id }
				})
			}else{
				$http({
				  url: 'php/saveCriteria.json',
				  method: 'POST',
				  data: { userid: user.id }
				})
				.success(function(data){
				    newCrit.id = data.criteria.id;
				});
		    
				criteriaItems.push(newCrit);
			}
			
			added = true;

		 }
 
 		 return added;
	}
	
	service.deleteTeamMember = function(user, index){
		
		if( teamMemberItems.length > 0 && index < teamMemberItems.length ){
			
			$http({
			  url: 'php/deleteTeamMember.json',
			  method: 'POST',
			  data: { userid: user.id, teamMemberid: teamMemberItems[index].id }
		    })  
			   
		 	teamMemberItems.splice( index, 1 );
		}
		return teamMemberItems;
	}
	
	service.resetTeamMemberLogin = function(user, index){
		
		if( teamMemberItems.length > 0 && index < teamMemberItems.length ){
			
			$http({
			  url: 'php/resetTeamMember.json',
			  method: 'POST',
			  data: { userid: user.id, teamMemberid: teamMemberItems[index].id }
		    })  
		}
	}
	
	service.editTeamMember = function(index){
		
		var member = teamMemberItems[index];
	
		var copyMember = {
			username: member.username,
			name: member.name,
			roleText: member.role.text,
			roleSymbol: member.role.symbol
		}
		
		return copyMember;

	}
	
	service.saveTeamMember = function(user, saveMember, index){
		
		var added = false;
		
		if( angular.isDefined(index)){
		  var newMember = teamMemberItems[index];
		}else{
		  
		  var newMember = {};
		  newMember.role = {};
		  
		}
		
		if( angular.isDefined(saveMember.username)
		 && angular.isDefined(saveMember.name)
		 && angular.isDefined(saveMember.roleText) 
		 && angular.isDefined(saveMember.roleSymbol) ){
			
			newMember.name = saveMember.username;
			newMember.name = saveMember.name;
			newMember.role.text = saveMember.roleText;
			newMember.role.symbol = saveMember.roleSymbol;
			
			if(angular.isDefined(index)){

				$http({
				  url: 'php/saveTeamMember.json',
				  method: 'POST',
				  data: { userid: user.id, teamMemberid: newMember.id }
				})
			}else{
				$http({
				  url: 'php/saveTeamMember.json',
				  method: 'POST',
				  data: { userid: user.id }
				})
				.success(function(data){
				    newMember.id = data.teamMember.id;
				});
		    
				teamMemberItems.push(newMember);
			}
			
			added = true;

		 }
 
 		 return added;
	}
	
	return service;
	

/*	var addCriteria = function(newTopic, newRatingItems, callback){
		
		var criteria = {			
			topic: newTopic,
			ratingItems: newRatingItems	
		};
		
		saveData( 
		  'php/addCriteria.json',
		   { id: loginService.user.id, criteria: criteria },
		   function(success){
			  if(success){
	              //Reload Criteria & Team Member data
                  var loadCriteria( callback );
			  }
		   });
		
		//Reload Criteria & Team Member data
		var loadCriteria( callabck);
	}
		
	var deleteTeamMember = function(index, callback){
		
		if( var criteriaItems.length > 0 && index < var criteriaItems.length ){
			saveData( 
			  'php/deleteTeamMember.json',
			   { id: loginService.user.id },
			   function(success){
				  if(success){
					  var loadTeamMember( callback );
				  }
			   });
		}
	}
	var addTeamMember = function( newName, newRole, callback ){
		
		var member = {
		  name: newName,
		  role: newRole,
		  ratingState: "open",
		  ratedTeamMemberItems: []
		  
		};
		
		saveData( 
		  'php/addTeamMember.json',
		   { id: loginService.user.id, teamMember: member },
		   function(success){
			  if(success){
	              var loadTeamMember( callback );
			  }
		   });
				  		
	}
	
	function saveData( reqRrl, reqData, callback ){
		
		$http({
			url: reqRrl,
			method: "POST",
			data: reqData
		}) 
		.success(function(response){
			
			if( response.state = "0" ){
				callback(true);
			}else{
				callback(false);
			}			
		})
		.error(function(data, state){
			
			console.log( state + " / " + data );			
			callback(false);

		})

	}
*/})