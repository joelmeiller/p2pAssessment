<?php
class CriteriaHandler extends DataHandler
{
	
	//Variable for MySql connection
	private $getSubjectSql 		= "SELECT criteriaTitle FROM project WHERE id = 1 LIMIT 1";
	private $getReferenceSql 	= "SELECT ref, description, symbol, value FROM rating WHERE refType='reference'";
	
	public function __construct( $subhandler=null )
	{
	    
		parent::__construct( $subhandler , true );

		$this->table      = "criteria";
		
	    $this->getSql     = "SELECT id, topic FROM $this->table WHERE projectId = 1";
		$this->getByIdSql = "SELECT id, topic FROM $this->table WHERE id=";
		$this->insertSql  = "INSERT INTO $this->table ";
		$this->deleteSql  = "DELETE FROM $this->table WHERE id=";
		$this->updateSql  = "UPDATE $this->table SET ";

	}
	
	public function getSubject()
	{
 		$subject;
		
		//Get project title
		try{
			$projectResult = $this->connection->query( $this->getSubjectSql );
			
			if( $project = $projectResult->fetch_assoc()){
				$subject = $project['criteriaTitle'];
			}
		}
		catch(Exception $e)
	    {
			$output = array();
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';
			return $output;
	    }
		
		return $subject;
	}
	
	
	public function getRatingReferenceItems(){

		$list = array();
		
	    try
	    {
			//Get Rating References			
			$ratingResult = $this->connection->query( $this->getReferenceSql );
			while($rating = $ratingResult->fetch_assoc()){
				$list[] = $rating;	
			}
			$ratingResult->close();			
	    }
	    catch(Exception $e)
	    {
			$output = array();
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';
			return $output;
	    }

		return $list;
			
	}
	
	public function insertItem($item, $userId=null, $infoText=null , $status=true )
	{
		$output = parent::insertItem($item, $userId, $infoText);
		
		//Add new ratings
		$teammemberHandler = new TeammemberHandler(); 
		$teammembers = $teammemberHandler->getItemsByProject(false);
		
		$teammemberRatingHandler = new TeammemberRatingHandler();
		
		for($i=0; $i< count($teammembers) ; $i++){
			for($j=0; $j < count($teammembers); $j++){
				$ratingData = array( 'userId' => $teammembers[$i]['id'] 
														   , 'teammemberId' => $teammembers[$j]['id']
														   , 'criteriaId' => $output['criteria']['id'] );
				$teammemberRatingHandler->insertItem( $ratingData );
			}
		}
		
		return $output;
	}
	
	public function deleteItem($id, $userId=null, $infoText=null , $status=true )
	{
		$output = parent::deleteItem($id, $userId, $infoText);
		
		
		$teammemberRatingHandler = new TeammemberRatingHandler();
		$teammemberRatingHandler->deleteItemsByCriteria($id);
		
		return $output;
	}	
}

?>