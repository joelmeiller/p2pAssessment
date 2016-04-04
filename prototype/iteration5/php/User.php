<?php
class User extends TeammemberHandler
{
	
	//Variable for MySql connection
	private $projectSql;
	private $getUserSql;
	
	private $id;
	private $username;
	private $fullname;
	private $ratingState;
	private $role;
	private $admin = false;
	private $openRating = false;
	private $autorized = false;
	private $token;
	
	private $project;
	private $ratingAvailable;
	
	private static $secretKey = 'j19P!13asdQtW87';

	public function __construct($id)
	{
	    		
		parent::__construct();
		
		$this->id = $id;
		
		//Get table name and make connection
		$this->projectSql = "SELECT title, projectState, isOpenRating FROM project WHERE id = 1 LIMIT 1";
		$this->getUserSql = "SELECT username, name, ratingState, roleId, isAdmin FROM $this->table WHERE id ='$id' LIMIT 1";
		
		$this->getUser();

	}
	public static function checkLoginCredentials($uname, $pwd){
		
		//Check username and password
		$checkLoginSql = "SELECT id FROM teammember WHERE username = '$uname' AND password = '$pwd' LIMIT 1";
		
		try{
			$con = DBConnection::get();
			$loginResult = $con->query( $checkLoginSql );
				
			if( $login = $loginResult->fetch_assoc()){
				$user = new User( $login['id'] );
				$user->authorized = true;
				
				//create token
				$key = array();
				$key['id'] = $user->id;
				
				$user->token = JWT::encode( $key, self::$secretKey );
				
				return $user;

			}
		}catch (Exception $e){
			http_response_code(503);
			$output = array();
			$output['message'] = "Sever Exception: " .$e;
			print json_encode($output);
			exit();
		}
		
		return false;
	}
	
	public static function checkToken($token){
		
		try{
			$verifiedToken = JWT::decode( $token, self::$secretKey );
		}catch (Exception $e){
			http_response_code(503);
			$output = array();
			$output['message'] = "Severe Exception: " .$e;
			print json_encode($output);
			exit();
		}
		
		if( $verifiedToken->id != null ){
			$user = new User($verifiedToken->id);
			$user->authorized = true;
			
			return $user;	
		}
		
		return false;
	}
	
	public function getId(){
		return $this->id;
	}
	public function isAdmin(){
		return $this->admin;
	}
	public function isOpenRating(){
		return $this->openRating;
	}
	public function isAuthorized(){
		return $this->authorized;
	}
	
	private function getUser()
	{		
		//Get project isOpen flag
		try{
			$projectResult = $this->connection->query( $this->projectSql );
						
			if( $project = $projectResult->fetch_assoc()){
				$this->project = array();
				$this->project['title'] = $project['title'];
				$this->openRating = ($project['isOpenRating'] == '1');
				$this->ratingAvailable = ( $project['projectState'] == 'open' );
			}
		}
		catch(Exception $e)
	    {
			$this->open = false;
	    }
	
	    try
	    {
			//Get Criteria
			$userResult = $this->connection->query($this->getUserSql);
			
			if( $userItem = $userResult->fetch_assoc()){
				$this->username = $userItem['username'];
				$this->fullname = $userItem['name'];
				$this->ratingState = $userItem['ratingState'];
				
				if( $userItem['roleId'] != null ){
					$roleHandler = new RoleHandler();
					$this->role = $roleHandler->getItemById($userItem['roleId']);
				}
				$this->admin = ($userItem['isAdmin'] == '1');
			}
		}
		catch(Exception $e)
	    {
			$this->admin = false;
	    }
	}
	
	public function toJson(){
		
		//Preapre user
		$userItem = array();
		$userItem['id']			= $this->id;
		$userItem['username'] 	= $this->username;
		$userItem['name'] 		= $this->fullname;
		$userItem['ratingState'] = $this->ratingState;
		$userItem['role'] 		= $this->role;	


		//Prepare user options
		$optionItem = array();
		$optionItem['self'] 	= (!$this->admin && !$this->openRating);
		$optionItem['all']  	= ($this->admin && !$this->openRating);
		
		//Prepare rating options
		$ratingItem = array();
		$ratingItem['available'] = $this->ratingAvailable && !$this->admin;
		$ratingItem['closed'] 	= !$this->ratingAvailable || ( $this->ratingState == 'closed' );
		$ratingItem['openForAll'] = $this->openRating;
		
		$optionItem['rating'] 	= $ratingItem;
		$optionItem['edit'] 	= $this->admin;
		
		$userItem['options']	= $optionItem;

		//Prepare output array;
		$output = array();
		$output['token']		= $this->token;
		$output['project']		= $this->project;
		$output['user']			= $userItem;
		
		return $output;
	}
}

?>