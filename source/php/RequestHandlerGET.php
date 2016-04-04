<?php
ERROR_REPORTING( E_ALL | E_STRICT );
ini_set("display_errors", 1);
function __autoload($class_name) 
{
    include $class_name . '.php';
}

class RequestHandlerGET{
	
	private $params;
	
	public function __construct(){
		
		
		$this->params = (object) array_slice($_GET, 0);
								
		$handler = new RequestHandlerBase($this->params);
		
	}
}

header('Content-Type: application/json');


//Create new instance to perform action
$requestHandler = new RequestHandlerGET();



?>