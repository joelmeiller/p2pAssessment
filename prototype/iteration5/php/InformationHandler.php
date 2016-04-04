<?php
class InformationHandler extends DataHandler
{
	
	private $lastItem;
	
	public function __construct()
	{		
		parent::__construct();
		
		//Get table name and make connection
	    $this->table = "information";

	    $this->getSqlWithId 	
						 = "SELECT id, type, text FROM $this->table WHERE teammemberId=";	
		$this->getByIdSql= "SELECT id, type, text FROM $this->table WHERE id=";
		$this->insertSql = "INSERT INTO $this->table ";
		$this->deleteSql = "DELETE FROM $this->table WHERE id=";
	}	
}

?>