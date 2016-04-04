<?php
class TeammemberHandler extends DataHandler
{
	
	//Variable for MySql connection

	public function __construct($id=null, $subhandler=null)
	{
	    
		parent::__construct( $subhandler , true);
		
		//Get table name and make connection
	    $this->table = "teammember";

	    $this->getSql    = "SELECT id, username, name, ratingState, roleId FROM $this->table t".
						   " WHERE projectId=1 AND isAdmin = '0'";	
	    $this->getSqlWithId = "SELECT DISTINCT t.id, CASE WHEN id = $id THEN 'Eigenbewertung' ELSE t.name END AS 'name', ".
							  "CASE t.id WHEN r.userid THEN 'self' END AS 'ref', t.roleId ".
							  "FROM $this->table t ".
							  "JOIN teammember_rating r ON r.teammemberId = t.id ".
							  "WHERE t.isAdmin = '0' ".
							  "  AND r.userId=";	
		$this->getByIdSql= "SELECT id, username, name, ratingState, roleId FROM $this->table t WHERE id=";
		$this->insertSql = "INSERT INTO $this->table ";
		$this->deleteSql = "DELETE FROM $this->table WHERE id=";
		$this->updateSql = "UPDATE $this->table SET ";
		
		$this->orderBy = " ORDER BY t.name";
	}
	
	public function getItemsByProject($includeRating=true)
	{
 		$outputList = array();
			
 		$list = parent::getItems();
		
		foreach( $list as $item ){
			$outputItem = array();
			foreach( $item as $key => $value ){
				//Get Role
				if( $key == 'roleId' ){
					$roleHandler = new RoleHandler();
					$outputItem[$roleHandler->getName()] = $roleHandler->getItemById($value);
				}else{
					$outputItem[$key] = $value;				
				}			
			}
			
			//Get Rated Teammembers
			if( $includeRating ){
				$teammemberHandler = new TeammemberHandler($item['id'], new TeammemberRatingHandler( $item['id'] , false ));
				$outputItem['TeammemberRatingItems'] = $teammemberHandler->getItems($item['id']);	
			}
				
			$outputList[] = $outputItem;
		}
	
		return $outputList;
	}
	
	public function getItems($userId=null)
	{
 		$outputList = array();
			
 		$list = parent::getItems($userId);
		
		foreach( $list as $item ){
			$outputItem = array();
			foreach( $item as $key => $value ){
				//Get Role
				if( $key == 'roleId' ){
					$roleHandler = new RoleHandler();
					$outputItem[$roleHandler->getName()] = $roleHandler->getItemById($value);
				}else{
					$outputItem[$key] = $value;				
				}			
			}
			
			$outputList[] = $outputItem;
		}
	
		return $outputList;
	}
	
	public function getItemById($id)
	{
 		$item = array();
			
 		$item = parent::getItemById($id);
		
		foreach( $item as $key => $value ){
			//Get Role
			if( $key == 'roleId' ){
				$roleHandler = new RoleHandler();
				$item[$roleHandler->getName()] = $roleHandler->getItemById($value);
			}else{
				$item[$key] = $value;				
			}			
		}
			
		return $item;
	}
	
	public function insertItem($item, $userId=null, $infoText=null, $status=true ){
		
		
		$items = array();
		
		$role;
									
		foreach( $item as $key => $value ){	
			if( $key == "role" ){	
				$role = $value;
			}else{
				$items[$key] = $value;
			}
		}
		
		//Search Role
		$roleHandler = new RoleHandler();
		$roles = $roleHandler->getItems();

		$r = 0;
		$found = false;
		
		while( $r < count($roles) && !$found ){
			if( $roles[$r]['title'] == $role->title && $roles[$r]['symbol'] == $role->symbol ){
				$found = true;
				$items['roleId'] = $roles[$r]['id'];
			}
			$r++;
		}
		
		//Add new role
		if( !$found ){
			$newRole = $roleHandler->insertItem( array( 'title' => $role->title , 'symbol' => $role->symbol ) );
			$items['roleId'] = $newRole['role']['id'];
		}
			
		//Insert Teammember
		$output = parent::insertItem( $items , $userId, $infoText );
		
		if( $output['status'] == 'ok' ){
			
			//Add teammember ratings items
			$criteriaHandler = new CriteriaHandler();
			$criteria = $criteriaHandler->getItems();
	
			$teammemberHandler = new TeammemberHandler(); 
			$teammembers = $teammemberHandler->getItemsByProject(false);
			
			$teammemberRatingHandler = new TeammemberRatingHandler();
			
			for($i=0; $i< count($teammembers) ; $i++){
				for($j=0; $j < count($criteria); $j++){
					$ratingData = array( 'userId' => $output['teammember']['id'] 
									   , 'teammemberId' => $teammembers[$i]['id']
									   , 'criteriaId' => $criteria[$j]['id'] );
					$teammemberRatingHandler->insertItem( $ratingData );
				}
			}
			
			//Add new teammember to existing teammember ratings
			for($i=0; $i< count($teammembers) ; $i++){
				for($j=0; $j < count($criteria); $j++){
					if( $output['teammember']['id'] != $teammembers[$i]['id'] ){
						$ratingData = array( 'userId' => $teammembers[$i]['id']  
										   , 'teammemberId' => $output['teammember']['id']
										   , 'criteriaId' => $criteria[$j]['id'] );
						$teammemberRatingHandler->insertItem( $ratingData );
					}
				}
			}		
		}
		
		return $output;
	}
	
	public function updateItem($item, $userId=null, $infoText=null, $status=true ){
		
		$items = array();
		
		$role;
									
		foreach( $item as $key => $value ){	
			if( $key == "role" ){	
				$role = $value;
			}else{
				$items[$key] = $value;
			}
		}
		
		//Search Role
		$roleHandler = new RoleHandler();
		$roles = $roleHandler->getItems();

		$r = 0;
		$found = false;
		
		while( $r < count($roles) && !$found ){
			if( $roles[$r]['title'] == $role->title && $roles[$r]['symbol'] == $role->symbol ){
				$found = true;
			}
			$r++;
		}
		
		//Add new role
		if( !$found ){
			$newRole = $roleHandler->insertItem( array( 'title' => $role->title , 'symbol' => $role->symbol ) );
			$items['roleId'] = $newRole['role']['id'];
		}

		
		return parent::updateItem($items, $userId, $infoText );
	}
	
	public function deleteItem($id, $userId=null, $infoText=null, $status=true ){
		$output = parent::deleteItem($id, $userId, $infoText);
		
		
		$teammemberRatingHandler = new TeammemberRatingHandler();
		$teammemberRatingHandler->deleteItemsByUser($id);
		$teammemberRatingHandler->deleteItemsByTeammember($id);
		
		return $output;
	}
	
	public function closeRating($id){
		$output = array();
			
		$item = array( 'id' => $id , 'ratingState' => 'closed' );	
			
		$output = parent::updateItem($item);
		
		return $output;		
	}
}

?>