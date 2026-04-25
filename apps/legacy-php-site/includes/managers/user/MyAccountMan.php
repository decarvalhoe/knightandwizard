<?php
	class MyAccountMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Recupere un User en fonction de son ID
		public function getUserById($_DB, $id){
			$User = $_DB->getUserById($id);

			return $User;
		}

		// Modifie le parametre de reception des alertes d un User
		public function updateUserGameUpdateAlert($_DB, $User, $gameUpdateAlert){
			$_DB->updateUserGameUpdateAlert($User->id, $gameUpdateAlert);
		}

		// Modifie le parametre de reception des alertes d un User
		public function updateUserNewCommentAlert($_DB, $User, $newCommentAlertValue){
			$_DB->updateUserNewCommentAlert($User->id, $newCommentAlertValue);
		}
	}
?>
