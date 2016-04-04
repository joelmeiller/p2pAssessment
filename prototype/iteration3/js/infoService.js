
angular
.module('ipApp')
.factory('InfoService', function( $http, $q) {
	
	var deffered = $q.defer();
	var service = {};
	
	var infoItem = { id: "closedRating" }; 
	var infoItems = [];
	
	service.infoItems = function(){ return infoItems; };			
		
	service.loadData = function(user){
		
	    var infoItems = [];
		
		$http({
			url: 'php/getInformationListByUser.json',
			method: 'POST',
			data: { userid:	user.id }
		})
		.success(function(response) {
			
		  infoItems = response.informationItems;
  
		  deffered.resolve(infoItems);
				 
		}); 
		return deffered.promise;
	
	}
	
	service.deleteInfoItem = function(infoItems, user, index){
		if( infoItems.length > 0 && index < infoItems.length ){
			
			if( angular.isDefined(infoItems[index].id) ){
				$http({
					url: 'php/deleteInformation.json',
					method: 'POST',
					data: {	userid: user.id, infoid: infoItems[index].id }
				});
			}

			infoItems.splice(index, 1);
		}
		return infoItems;
	}
	
	service.addInfoItem = function(infoItems, infoType, infoText ){
		infoItem = { type: infoType, text: infoText }
		infoItems.push( infoItem );
		return infoItems;
	}
	
	return service;	

})