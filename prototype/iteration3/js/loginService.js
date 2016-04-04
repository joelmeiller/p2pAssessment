angular
.module('ipApp')
.factory('LoginService', function( $http, $q) {
	
	var deffered = $q.defer();
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
	};
	
	service.checkLogin = function(username, password){
		
	    error.show = false;
		
		$http({
			url: 'php/checkLogin.json',
			method: 'POST',
			data: { name: username, password: password }
		})
		.success(function(response) {
			
		  // User successfully logged in
		  if( response.loginState == "200" ){  
			 user = response.user; 
			 project = response.project.title;
			 loggedIn = true;			 
		  }	
		  
		  deffered.resolve();
				 
		})
		.error(function(msg, code){
			
		  error.show = true;
          deferred.reject(msg);
	
		}); 
		return deffered.promise;
	
	}
	return service;
})