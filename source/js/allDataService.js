define( function() 
{
	function AllDataService( $rootScope, $http, $q, store, InfoService ) 
	{

	  //var $rootScope.requestHandlerUrl = 'http://localhost:8080/p2passessment/php/RequestHandler.php';
	  var defferedCrit = $q.defer();
	  var defferedMember = $q.defer();
	  var service = {};
	  
	  var template_ratedCriteriaItems = [];
  
	  //*****************
	  //Public Attributes
	  //*****************
	  var criteriaItems = [];
	  var ratingReferenceItems = [];
	  var memberItems = [];
		  
	  
	  service.criteriaItems = function(){ return criteriaItems };
	  service.ratingReferenceItems = function(){ return ratingReferenceItems };
	  service.teammemberItems = function(){ return memberItems };
  
	  service.clear = function(){
		  criteriaItems = [];
		  ratingReferenceItems = [];
		  memberItems = [];
	  }
  
	  //Load Criteria Data
	  service.loadCriteria = function(){
		  
		  criteriaItems = [];
		  var token = store.get('jwt'); //For test reasons		
		  $http({
			  url: $rootScope.requestHandlerUrl,
			  method: 'POST',
			  data: { operation : 'GetCriteriaList' , token: store.get('jwt') }
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
		  
	  //Load Teammember Data		
	  service.loadTeammemberList = function(user){
		  
		  memberItems = [];
		  
		  $http({
			  url: $rootScope.requestHandlerUrl,
			  method: 'POST',
			  data: { operation : 'GetRatingList' , token: store.get('jwt') }
		  }) 
		  .success(function(response){
						  
			  memberItems = response.teammemberItems;
			  
			  //Get Tooltip
			  angular.forEach( memberItems, function( member, m ){
				  angular.forEach( member.TeammemberRatingItems, function( ratedBy, r ){
					  angular.forEach( ratedBy.criteriaItems, function( criteria, c ){
						criteria.tooltip = "<p><b>" + ratedBy.name + "</b></p>"
										+ "<p>" + criteria.comment + "</p>";
						  
					  });
				  });
			  });
			  
			  defferedMember.resolve(memberItems);
			  
		  })
		  .error(function(msg, code){
			  
			  console.log( msg + " / " + code );
			  defferedMember.reject(msg);
			  
		  });
		  
		  return defferedMember.promise;
	  }	
	  
	  //Prepare data for bar chart view
	  service.barChartData = function( byCriteria , critIndex ){
		
		var criteria = [];
			
		var labels = [];
		for( var m=0; m < memberItems.length; m++ ){
			labels[m] = memberItems[m].name;
		}   
		
		var datasets = [];
		for( var m=0; m < memberItems.length; m++ ){
			
			var data = [];
			for( var t=0; t < memberItems[m].TeammemberRatingItems.length; t++ ){
				data[t] = memberItems[m].TeammemberRatingItems[t].criteriaItems[critIndex].rating;
			}
			
			datasets[m] = data; 	
		}
		
		criteria = {
			labels: labels,
			data: data
		}   
				
		
		  
		return criteria;
	  	
	  }
	  
	  //Modifiation functions
	  service.deleteCriteria = function(user, index){
		  
		  if( criteriaItems.length > 0 && index < criteriaItems.length ){
			  
			  $http({
				url: $rootScope.requestHandlerUrl,
				method: 'POST',
				data: { operation : 'DeleteCriteria' , token: store.get('jwt')  , id: criteriaItems[index].id }
			  }) 
			  .success(function(response){
				  if( response.status = 'ok' ){
					  criteriaItems.splice( index, 1 );
				  }
				  $rootScope.infoItems = InfoService.addInfoItem( $rootScope.infoItems, response.information );
			  })
				 
		  }
		  console.log( criteriaItems.length );
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
		  var operation = 'Insert';
		  
		  if( angular.isDefined(index)){
			var newCrit = criteriaItems[index];
			operation = 'Update';
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
			  
  
			  $http({
				url: $rootScope.requestHandlerUrl,
				method: 'POST',
				data: { operation : (operation + 'Criteria') , token: store.get('jwt')  , criteria: newCrit }
			  })
			  .success(function(response){
				  if( response.status = 'ok' ){
					  if( operation == "Insert" ){
					  	newCrit.id = response.criteria.id;
					  	criteriaItems.push(newCrit);
					  }
				  }
				  $rootScope.infoItems = InfoService.addInfoItem( $rootScope.infoItems, response.information );
			  });
			  
			  added = true;
  
		   }
   
		   return added;
	  }
	  
	  service.saveRatingOption = function(user){
		  
		  if( user.options.rating.openForAll ) { $isOpenRating = '1' }else{ $isOpenRating = '0' };
  		  
		  $http({
			url: $rootScope.requestHandlerUrl,
			method: 'POST',
			data: { operation : 'UpdateRatingOption' , token: store.get('jwt')  , project : { id: 1 , isOpenRating: $isOpenRating } }
		  })
		  .success(function(response){	
			  $rootScope.infoItems = InfoService.addInfoItem( $rootScope.infoItems, response.information );
		  })
	  }
	  
	  service.deleteTeammember = function(user, index){
		  
		  if( memberItems.length > 0 && index < memberItems.length ){
			  
			  $http({
				url: $rootScope.requestHandlerUrl,
				method: 'POST',
				data: { operation : 'DeleteTeammember' , token: store.get('jwt')  , id: memberItems[index].id }
			  })
			  .success(function(response){	
				  if( response.status = 'ok' ){
					  memberItems.splice( index, 1 );
				  }
				  $rootScope.infoItems = InfoService.addInfoItem( $rootScope.infoItems, response.information );
			  })
				 
		  }
		  return memberItems;
	  }
	  
	  service.resetTeammemberLogin = function(user, index){
		  
		  if( memberItems.length > 0 && index < memberItems.length ){
			  
			  $http({
				url: 'php/resetPassword.json',
				method: 'POST',
				data: { userid: user.id, teammemberid: memberItems[index].id }
			  })  
		  }
	  }
	  
	  service.editTeammember = function(index){
		  
		  var member = memberItems[index];
	  
		  var copyMember = {
			  username: member.username,
			  name: member.name,
			  roleTitle: member.role.title,
			  roleSymbol: member.role.symbol
		  }
		  
		  return copyMember;
  
	  }
	  
	  service.saveTeammember = function(user, saveMember, index){
		  
		  var added = false;
		  var operation = 'Insert';
		  
		  if( angular.isDefined(index)){
			var newMember = memberItems[index];
			operation = 'Update';
		  }else{
			
			var newMember = {};
			newMember.role = {};
			
			if( angular.isDefined(saveMember.password) ){		  
			  newMember.password = saveMember.password;  
			}
		  }
		  
		  if( angular.isDefined(saveMember.username)
		   && angular.isDefined(saveMember.name)
		   && angular.isDefined(saveMember.roleTitle) 
		   && angular.isDefined(saveMember.roleSymbol) ){
			  
			  newMember.username = saveMember.username;
			  newMember.name = saveMember.name;
			  newMember.role.title = saveMember.roleTitle;
			  newMember.role.symbol = saveMember.roleSymbol;
  			
			  $http({
				url: $rootScope.requestHandlerUrl,
				method: 'POST',
				data: { operation : (operation + 'Teammember') , token: store.get('jwt') , teammember: newMember }
			  })
			  .success(function(response){
				  if( response.status = 'ok' ){
					  if( operation == "Insert" ){
					  	newMember.id = response.teammember.id;
					  	memberItems.push(newMember);
					  }
				  }
				  $rootScope.infoItems = InfoService.addInfoItem( $rootScope.infoItems, response.information );
			  });
			  
			  added = true;
  
		   }
   
		   return added;
	  }
	  
	  return service;
	};
	
	AllDataService.$inject = ['$rootScope', '$http', '$q', 'store', 'InfoService'];

	return AllDataService;
})
