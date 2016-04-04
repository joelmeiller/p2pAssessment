<?php
ERROR_REPORTING( E_ALL | E_STRICT );
ini_set("display_errors", 1);
function __autoload($class_name) 
{
    include $class_name . '.php';
}
class RequestHandler{
	
	private $operation;
	private $params;
	
	public function __construct(){
		
		
		$this->params = (object) array_slice($_GET, 0);
										
		$output = array();			
															
		if( !isset($this->params->operation) ){			
			http_response_code(400);
			$output['message'] = 'Operation nicht definiert';
			
		}else{
					
			if( $this->params->operation != 'CheckLogin' && !isset( $this->params->token ) ){
				http_response_code(403);
				$output['message'] = 'Ungültige Parameter für Benutzeridentifkation';
			}else{
				
				//New Login (create token)
				if( $this->params->operation == 'CheckLogin' ){
					
					if( !($user = User::checkLoginCredentials($this->params->username, $this->params->pwd)) ){
						http_response_code(403);
						$output['message'] = 'Benutzeridentifkation fehlgeschlagen (Credentials ungültig)';
					}
				
				//Follow up calls (token exists)	
				}else{
					if( !($user = User::checkToken($this->params->token)) ){
						http_response_code(403);
						$output['message'] = 'Benutzeridentifkation fehlgeschlagen (Token ungültig)';
					}
				}
				
				if( $user && $user->isAuthorized() ){
					$output = $this->performAction($user);
				}else{
					http_response_code(403);
					$output['message'] = 'Authentifizerung fehlgeschlagen';
				}
			}
		}
		
		print JWT::jsonEncode($output);
	
	}
	
	private function performAction($user){
		
		DBConnection::open();
		
		$output = array();
		
		//Check user rights
		$operationAllowed = false;
		if( $this->params->operation == 'CheckLogin' ){
			$operationAllowed = true;
		}else if ($this->params->operation == 'GetCriteriaList'){
			$operationAllowed = true;
		}else{
		
			switch ($this->params->operation){
				case 'GetInformationListByUser':
					$operationAllowed = true;
					break;
				case 'GetRatingList':
					$operationAllowed = $user->isAdmin();
					break;
				case 'GetRatingListByUser':
					$operationAllowed = !$user->isAdmin();
					break;
				case 'DeleteCriteria':
					$operationAllowed = $user->isAdmin();
					break;
				case 'DeleteInformation':
					$operationAllowed = true;
					break;
				case 'DeleteTeammember':
					$operationAllowed = $user->isAdmin();
					break;
				case 'InsertCriteria':
					$operationAllowed = $user->isAdmin();
					break;
				case 'InsertTeammember':
					$operationAllowed = $user->isAdmin();
					break;
				case 'UpdateCriteria':
					$operationAllowed = $user->isAdmin();
					break;
				case 'UpdateTeammember':
					$operationAllowed = $user->isAdmin();
					break;
				case 'UpdateRating':
					$operationAllowed = !$user->isAdmin();
					break;
				case 'UpdateRatingOption':
					$operationAllowed = $user->isAdmin();
					break;
				case 'CloseRating':
					$operationAllowed = !$user->isAdmin();
					break;
			}
		}
		
		if( $operationAllowed ){
			
			//Perform action
			switch ($this->params->operation){
				case 'CheckLogin':
					$output = $user->toJson();
				case 'GetCriteriaList':
					$criteriaHandler = new CriteriaHandler( new RatingHandler() );
					$output['subject'] = $criteriaHandler->getSubject();
					$output[$criteriaHandler->getName().'Items'] = $criteriaHandler->getItems();
					$output['ratingReferenceItems'] = $criteriaHandler->getRatingReferenceItems();
					break;
				case 'GetInformationListByUser':
					$informationHandler = new InformationHandler();
					$output[$informationHandler->getName().'Items'] = $informationHandler->getItems($user->getId());
					break;
				case 'GetRatingList':
					$teammemberHandler = new TeammemberHandler();
					$output[$teammemberHandler->getName().'Items'] = $teammemberHandler->getItemsByProject();
					break;
				case 'GetRatingListByUser':
					$teammemberHandler = new TeammemberHandler($user->getId(), new TeammemberRatingHandler($user->getId()) );
					$output[$teammemberHandler->getName().'Items'] = $teammemberHandler->getItems($user->getId());
					break;
				case 'DeleteCriteria':
					$criteriaHandler = new CriteriaHandler( new RatingHandler() );
					$output = $criteriaHandler->deleteItem($this->params->id, $user->getId(), 'Kriterium');
					break;
				case 'DeleteInformation':
					$informationHandler = new InformationHandler();
					$output = $informationHandler->deleteItem($this->params->id);
					break;
				case 'DeleteTeammember':
					$criteriaHandler = new TeammemberHandler($user->getId() , new TeammemberRatingHandler());
					$output = $criteriaHandler->deleteItem($this->params->id, $user->getId(), 'Teammitglied');
					break;
				case 'InsertCriteria':
					$criteriaHandler = new CriteriaHandler( new RatingHandler() );
					$output = $criteriaHandler->insertItem($this->params->criteria, $user->getId(), 'Kriterium');
					break;
				case 'InsertTeammember':
					$teammemberHandler = new TeammemberHandler();
					$output = $teammemberHandler->insertItem($this->params->teammember, $user->getId(), 'Teammitglied');
					break;
				case 'UpdateCriteria':
					$criteriaHandler = new CriteriaHandler( new RatingHandler() );
					$output = $criteriaHandler->updateItem($this->params->criteria, $user->getId(), 'Kriterium');
					break;
				case 'UpdateTeammember':
					$teammemberHandler = new TeammemberHandler();
					$output = $teammemberHandler->updateItem($this->params->teammember, $user->getId(), 'Teammitglied');
					break;
				case 'UpdateRating':
					$teammemberRatingHandler = new TeammemberRatingHandler();
					$output = $teammemberRatingHandler->updateItems($user->getId(), $this->params->teammember );
					break;
				case 'UpdateRatingOption':
					$projectHandler = new ProjectHandler();
					$output = $projectHandler->updateItems($this->params->project, $user->getId(), 'Änderung der Bewertung');
					break;
				case 'CloseRating':
					$teammemberHandler = new TeammemberHandler();
					$output = $teammemberHandler->closeRating($user->getId());
					break;
				default:
					break;
			}

		}else{
			http_response_code(404);
			$output['message'] = "Ungültige Operation";
		}


		DBConnection::close();	
		
		return $output;
	}
}

header('Content-Type: application/json');

//Create new instance to perform action
$requestHandler = new RequestHandler();

?>