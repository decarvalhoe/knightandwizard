<?php
	class LoginMan{
		// Constructeur de la classe
		public function __construct(){
		}

		public function checkValidUser($_DB, $email, $password){
			$password = hash('sha256', $password);

			$User = $_DB->getUserByEMailAndPassword($email, $password);

			return $User;
		}
	}
?>
