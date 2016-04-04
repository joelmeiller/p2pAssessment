<?php
class DBConnection
{
	private static $server    = 'localhost';
	private static $currentDB = 'p2p_assessment_db';
	
	//****************************************************
	// --> Set username and password for database access
	
	private static $username  = 'p2pAdmin';
	private static $password  = 'VisuLab15';
	
	//****************************************************
	
	private static $con;
	
	public static function open(){
		
		self::$con=mysqli_connect(self::$server, self::$username, self::$password, self::$currentDB);
		if(mysqli_connect_error(self::$con)) 
		{
			print('Connection Error: '  . mysqli_connect_error());
			exit( '403' );
		}
	}
	public static function get()
	{
		if(!self::$con){
			self::open();
		}
		return self::$con;
	}
	public static function close()
	{
		if(self::$con){
			mysqli_close(self::$con);
		}
	}
}
?>
