define( function() 
{
	function LoginService( $rootScope, $http, $q , store )
	{

	  //var $rootScope.requestHandlerUrl = 'http://localhost:8080/p2passessment/php/RequestHandler.php';
	  var service = {};
	  
	  var loggedIn = false;
	  var project = ""; 
	  var user = null; 
	  var error = { show: false, text: "Die Applikation steht aktuell nicht zur Verfügung. Bitte versuche es später nochmals." };
			  
	  service.login = function(){ return loggedIn; };			
	  service.project = function(){ return project; };			
	  service.user = function(){ return user; };			
	  service.error = function(){ return error; };
		  
	  service.logout = function(){ 
		  loggedIn = false 
		  project = "";
		  user = null;	 
		  error = { show: false, text: "Die Applikation steht aktuell nicht zur Verfügung. Bitte versuche es später nochmals." };
		  store.remove('jwt');
	  };
	  
	  service.checkLogin = function(username, password){
		  
		  var deffered = $q.defer();
		  
		  error.show = false;
				  
		  $http({
			  url: $rootScope.requestHandlerUrl,
			  method: 'POST',
			  data: { operation: 'CheckLogin', username: username, pwd: password }
		  })
		  .success(function(response) {
			  
			// User successfully logged in
			user = response.user; 
			project = response.project.title;
			loggedIn = true;			 
			
			// Store token
			store.set('jwt', response.token);
			deffered.resolve(response.token);		  
				   
		  })
		  .error(function(msg, code){
			error.show = true;
			deffered.reject();
	  
		  }); 
			  
		  return deffered.promise;
	  
	  }
	  return service;
	  
  };
  
  LoginService.$inject = [ '$rootScope','$http','$q','store' ];
  
  return LoginService;
  
});

    
