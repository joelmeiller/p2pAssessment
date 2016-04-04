define( function() 
{
	function InfoService( $http, $q , store )
	{
		// Publish instance with simple login() and logout() APIs
	  var requestUrl = 'php/RequestHandler.php';
	  var deffered = $q.defer();
	  var service = {};
	  
	  var infoItem = { id: "closedRating" }; 
	  var infoItems = [];
	  
	  service.infoItems = function(){ return infoItems; };			
  
	  service.clear = function(){
		  infoItems = [];
	  }
	  
	  service.loadData = function(user){
		  
		  var infoItems = [];
		  
		  $http({
			  url: requestUrl,
			  method: 'POST',
			  data: { operation: 'GetInformationListByUser', token: store.get('jwt') }
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
					  url: requestUrl,
					  method: 'POST',
					  data: {	operation: 'DeleteInformation' , token: store.get('jwt'), id: infoItems[index].id }
				  });
			  }
  
			  infoItems.splice(index, 1);
		  }
		  return infoItems;
	  }
	  
	  service.addInfoItem = function( infoItems, infoItem ){
		  infoItems.push( infoItem );
		  return infoItems;
	  }
	  
	  return service;	
 
	};

	InfoService.$inject = [ '$http','$q','store' ];

	return InfoService;
});

    
