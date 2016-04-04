<?php
class RoleHandler extends DataHandler
{
	
	private $lastItem;
	
	public function __construct()
	{		
		parent::__construct();
		
		//Get table name and make connection
	    $this->table = "role";

	    $this->getSql    = "SELECT id, title, symbol FROM $this->table";	
	    $this->getByIdSql = "SELECT id, title, symbol FROM $this->table WHERE id=";	
		$this->insertSql = "INSERT INTO $this->table ";
		$this->deleteSql = "DELETE FROM $this->table WHERE id=";
	}	
}

?>