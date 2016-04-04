<?php
class ProjectHandler extends DataHandler
{
	
	private $lastItem;
	
	public function __construct()
	{		
		parent::__construct( null , true );
		
		//Get table name and make connection
	    $this->table = "project";

	    $this->getSql    = "SELECT id, title, criteriaTitle, isOpenRating FROM $this->table";	
	    $this->getByIdSql = "SELECT id, title, criteriaTitle, isOpenRating FROM $this->table WHERE id=";	
		$this->insertSql = "INSERT INTO $this->table ";
		$this->deleteSql = "DELETE FROM $this->table WHERE id=";
		$this->updateSql = "UPDATE $this->table SET ";
	}	
}

?>