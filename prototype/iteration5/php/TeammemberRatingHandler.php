<?php
class TeammemberRatingHandler extends DataHandler
{
	
	private $lastItem;
	
	public function __construct($userId=null)
	{		
		parent::__construct();
		
		//Get table name and make connection
	    $this->table = "teammember_rating";
		$this->name = "criteria";

	    $this->getSqlWithId  
						 = "SELECT r.criteriaId, r.rating, COALESCE( r.comment , 'Noch kein Kommentar') AS comment FROM $this->table r ".
						   "JOIN criteria c ON c.id = r.criteriaId ".
						   "JOIN teammember t ON t.id = r.teammemberId ".
						   "WHERE userid=$userId AND teammemberId=";
		$this->insertSql = "INSERT INTO $this->table ";
		$this->deleteSql = "DELETE FROM $this->table WHERE userId=";
		
	
	}
	
	public function deleteItemsByCriteria($id){
		$this->deleteSql = "DELETE FROM $this->table WHERE criteriaId=";
		
		parent::deleteItem($id);
	}
	
	public function deleteItemsByUser($id){
		$this->deleteSql = "DELETE FROM $this->table WHERE userId=";
		
		parent::deleteItem($id);
	}
	public function deleteItemsByTeammember($id){
		$this->deleteSql = "DELETE FROM $this->table WHERE teammemberId=";
		
		parent::deleteItem($id);
	}
	
	public function updateItems($id, $item){
		
		$output = array();
			
		foreach( $item->criteriaItems as $criteria ){
			$updateQuery = "UPDATE $this->table SET rating='$criteria->rating', comment='$criteria->comment' "
					     . "WHERE userId = '$id' AND teammemberId = '$item->id' AND criteriaId = '$criteria->criteriaId'";
			print $updateQuery;
			try{
				$ok = $this->connection->query($updateQuery);
				if( $ok ){
					$output['status'] = 'ok';
				}else{
					$output['status'] = 'not ok';
				}
				
			}catch(Exception $e){
				$output['name'] = 'JSONRequestError';
				$output['message'] = 'not ok';
			}
		}
		return $output;
		
	}
}

?>