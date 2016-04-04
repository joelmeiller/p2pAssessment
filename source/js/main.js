require.config({
	
    baseUrl: 'js', 
	   
    paths: {
			'jquery' : 'vendor/jquery-2.1.3.min',
			'bootstrap' : 'vendor/bootstrap.min',
			'angular' : 'vendor/angular',
			'angularAMD' : 'vendor/angularAMD.min',
			'ngLoad' : 'vendor/ngload.min',
			'angularJWT' : 'vendor/angular-jwt.min',
			'angularUIrouter' : 'vendor/angular-ui-router.min',
			'angularStorage' : 'vendor/angular-storage.min',
			'angularUIBootstrap' : 'vendor/ui-bootstrap-custom-0.12.1.min',
			'angularUIBootstrapTpls' : 'vendor/ui-bootstrap-custom-tpls-0.12.1.min',			
			'autosize' : 'vendor/autosize.min',
			'chart' : 'vendor/chart',
			'encryption' : 'vendor/encryption'					
    },
	
	shim: {
		'bootstrap' : ['jquery'],
		'angularAMD' : ['angular'],
		'ngLoad' : ['angularAMD'],
		'angularUIrouter' : ['angular'],
		'angularJWT' : ['angular'],
		'angularStorage' : ['angular'],
		'angularUIBootstrap' : ['angular'],
		'angularUIBootstrapTpls' : ['angularUIBootstrap'],
		'loginService' : ['angularStorage'],
		'infoService' : ['angularStorage'],
		'selfData' : ['allDataService','selfDataService'],
		'allData' : ['selfData','infoService','chart','encryption'],
		'app' : ['angularJWT','angularUIrouter','angularAMD','allData','loginService']

	},
		  
    deps: ['app']
});
