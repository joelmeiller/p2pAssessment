<?php
ERROR_REPORTING( E_ALL | E_STRICT );
ini_set("display_errors", 1);
function __autoload($class_name) 
{
    include $class_name . '.php';
}

class RequestHandler{
	
	private $params;
	
	public function __construct(){
		
		$inputData = file_get_contents("php://input");
		$this->params = json_decode($inputData);
								
		$handler = new RequestHandlerBase($this->params);
		
	}
}
//Get JSON data from angular request
		

		
header('Content-Type: application/json');


//Create new instance to perform action
$requestHandler = new RequestHandler();

?>