<?php
class RatingHandler extends DataHandler
{
	
	public function __construct()
	{
		parent::__construct();

		$this->table      = "rating";
		
	    $this->getSqlWithId 
						  = "SELECT id, ref, description, symbol, value FROM rating WHERE refType='item' AND criteriaId=";
		$this->getByIdSql = "SELECT id, ref, description, symbol, value FROM rating WHERE id=";
		$this->insertSql  = "INSERT INTO $this->table ";
		$this->deleteSql  = "DELETE FROM $this->table WHERE refType='item' AND criteriaId=";
		$this->updateSql  = "UPDATE $this->table SET ";
	}

}

?>