<?php
// Provides the standard db operations
// Set SQL statements in child
abstract class DataHandler
{
	
	//Variable for MySql connection
	protected $connection;
	protected $table = "";
	protected $name = "";
	
	private $hasInfo = false;
	private $infoHandler;

	protected $getSql;
	protected $getSqlWithId;
	protected $getByIdSql;
	protected $insertSql;
	protected $deleteSql;
	protected $updateSql;
	
	protected $orderBy = '';
	
	private $subhandler;
		
	private $lastItem;
	
	public function __construct( $subhandler=null, $hasInfo=false )
	{
	    
		//Get table name and make connection
	    $this->connection=DBConnection::get();
		
		$this->subhandler = $subhandler;
		
		if( $this->hasInfo = $hasInfo ){
			$this->infoHandler = new InformationHandler();
		}
	}
	
	public function getName(){
		if( $this->name == null ){
			return $this->table;
		}else{
			return $this->name;
		}
	}
	public function setName($name){
		$this->name = $name;
	}
	
	public function getItems($parentId=null)
	{
 		$list = array();
	
	    try
	    {
			//Get List
			if( $parentId == null ){
				$result = $this->connection->query($this->getSql.' '.$this->orderBy);
			}else{
				$result = $this->connection->query($this->getSqlWithId.$parentId.' '.$this->orderBy);
				//printf($this->getSqlWithId.$parentId.' '.$this->orderBy); 
			}
			while ($row = $result->fetch_assoc()) 
			{
				// Strips only null values
				$item = array_filter( $row, function ($val) {
					return !is_null($val);
				});

				//Get Sublist
				if( $this->subhandler != null ){
					$item[$this->subhandler->getName().'Items'] = $this->subhandler->getItems($row['id']);
				}
				
				$list[] = $item;
				
			}
		
			$result->close();				

	    }
	    catch(Exception $e)
	    {
			$output = array();
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';
			return $output;

			http_response_code(503);
	    }
				
		return $list;
			
	}
	
	public function getItemById($id)
	{
		if( $id == null ) return null;
		
		$item = array();
		
	    try
	    {
			//Get Item
			$result = $this->connection->query($this->getByIdSql.$id.' '.$this->orderBy);
						
			//Get Sublist
			if( $row = $result->fetch_assoc() ){
			  	
				// Strips only null values
				$item = array_filter( $row , function ($val) {
					return !is_null($val);
				});

			  if( $this->subhandler != null ){
				$item[$this->subhandler->getName().'Items'] = $this->subhandler->getItems($item['id']);
			  }
			};
			$result->close();

	    }
	    catch(Exception $e)
	    {
			$output = array();
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';
			return $output;
			
			http_response_code(503);
	    }
		return $item;
			
	}
	
	public function insertItem($item, $userId=null, $infoText=null , $status = true )
	{
 		$output = array();
		if( $status ){ $output['status'] = 'not ok'; }
		
	    try
	    {
			//Insert item
			$insertFields = "(";
			$insertValues = "(";	
			
			$subitems = array();
								
			foreach( $item as $key => $value ){		
				if( is_array( $value ) ){
					$subitems = $value;
				}else{
					$insertFields .= $key . ",";
					$insertValues .= "'" . $value . "',";
				}
			}
			
			//remove last "," and close bracket
			$insertFields = rtrim($insertFields,",");
			$insertFields .= ")";
			$insertValues = rtrim($insertValues,",");
			$insertValues .= ")";
					
			$result = $this->connection->query($this->insertSql . $insertFields . " VALUES " . $insertValues );
						
			if( $ok = $result && $this->getByIdSql != null ){
				
				$insertItemResult = $this->connection->query( $this->getByIdSql . $this->connection->insert_id );
								
				if( $insertItem = $insertItemResult->fetch_assoc() ){
					$this->lastItem = $insertItem;
					$output[$this->getName()] = $insertItem;	
					
					if( $this->subhandler != null ){
					    
					  foreach( $subitems as $value ){
						  $idName = $this->table."Id";
						  $value->$idName = $insertItem['id'];
						  $this->subhandler->insertItem( $value, null, null, false );
					  }
					}
					if( $status ){ $output['status'] = 'ok'; };
				}
			}
			
			if( $this->hasInfo && $userId != null && $infoText != null ){
				if( $ok ){
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'info' , 'text' => $infoText . ' erfolgreich gespeichert' ) );
				}else{
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'warning' , 'text' => $infoText . ' konnte nicht gespeichert werden' ) );
				}
			}

	    }
	    catch(Exception $e)
	    {
			if( $this->hasInfo && $userId != null && $infoText != null ){
				$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'error' , 'text' => $infoText . ' konnte nicht gespeichert werden' ) );
			}
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';
			
			http_response_code(503);
			
	    }

		if( $this->hasInfo ){
			$output['information'] = $this->infoHandler->getLastItem();	
		}
		
		return $output;
				
	}
	
	public function updateItem($item, $userId=null, $infoText=null, $status=true )
	{
 		$output = array();
		if( $status ){ $output['status'] = 'not ok'; }
		
	    try
	    {
			//Insert item
			$updateValues = "";	
			$updateId;
			$updateValid = false;
			
			$subitems = array();
								
			foreach( $item as $key => $value ){		
				if( is_array( $value ) ){
					$subitems = $value;
				}else if($updateValid = $key == "id"){
					$updateId = $value;
				}else{
					$updateValues .= $key . "='" . $value . "',";
				}
			}
			
			//remove last "," and close bracket
			$updateValues = rtrim($updateValues,",");
			
			$where = " WHERE id='".$updateId."'";
					
			$result = $this->connection->query($this->updateSql . $updateValues . $where );
									
			if( $ok = $result ){
				
				$updateItemResult = $this->connection->query( $this->getByIdSql . $updateId );
								
				if( $updateItem = $updateItemResult->fetch_assoc() ){
					$this->lastItem = $updateItem;
					$output[$this->getName()] = $updateItem;	
					
					if( $this->subhandler != null ){
					  foreach( $subitems as $value ){
						  $this->subhandler->updateItem( $value, null, null, false);
					  }
					}
				}
				if( $status ){ $output['status'] = 'ok'; }

			}
			
			if( $this->hasInfo && $userId != null && $infoText != null ){
				if( $ok ){
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'info' , 'text' => $infoText . ' erfolgreich gespeichert' ) );
				}else{
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'warning' , 'text' => $infoText . ' konnte nicht gespeichert werden' ) );
				}
			}

	    }
	    catch(Exception $e)
	    {
			if( $this->hasInfo && $userId != null && $infoText != null ){
				$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'error' , 'text' => $infoText . ' konnte nicht gespeichert werden' ) );
			}
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';

			http_response_code(503);
	    }

		if( $this->hasInfo ){
			$output['information'] = $this->infoHandler->getLastItem();	
		}
		
		return $output;
				
	}
		
	public function deleteItem($id, $userId=null, $infoText=null, $status=true )
	{
		$output = array();
		if( $status ){ $output['status'] = 'not ok'; }
		
	    try
	    {
			//Delete item
			$this->connection->query($this->deleteSql . $id);
			
			if( $this->hasInfo && $userId != null && $infoText != null ){
				if( $this->connection->affected_rows > 0 ){
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'info' , 'text' => $infoText . ' erfolgreich gelöscht' ) );
					if( $status ){ $output['status'] = 'ok'; }
				}else{
					$this->infoHandler->insertItem( array( 'teammemberId' => $userId, 'type' => 'info' , 'text' => $infoText . ' wurde bereits gelöscht' ) );
				}
			}

			if( $this->subhandler != null ){
				$this->subhandler->deleteItem($id, null, null, false);
			}
				

	    }
	    catch(Exception $e)
	    {
			if( $this->hasInfo && $userId != null && $infoText != null ){
				$this->infoHandler->insertItem( array( 'teammemberId' =>  $userId, 'type' => 'error' , 'text' => $infoText . ' konnte nicht gelöscht werden' ) );
			}
			$output['name'] = 'JSONRequestError';
			$output['message'] = 'not ok';

			http_response_code(503);
	    }	
		
		if( $this->hasInfo ){
			$output['information'] = $this->infoHandler->getLastItem();	
		}
		
		return $output;
		
	}
	
	public function getLastItem(){
		if( $this->lastItem != null ){
			return $this->lastItem;
		}
		return false;
	}


}

?>