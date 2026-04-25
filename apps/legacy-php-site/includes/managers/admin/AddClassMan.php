<?php
	class AddClassMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant toutes les famille de competences
		public function getAllOrientations($_DB){
			return $_DB->getAllOrientations();
		}

		// Ajoute une competence dans la DB
		public function insertClass($_DB, $name, $orientationId){
			if($name != ''){
				// AJout de la competence dans la DB
				$_DB->insertClass($name, $orientationId);
			}
		}
	}
?>
