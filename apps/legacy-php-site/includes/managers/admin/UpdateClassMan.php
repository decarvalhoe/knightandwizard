<?php
	class UpdateClassMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant toutes les famille de competences
		public function getAllOrientations($_DB){
			return $_DB->getAllOrientations();
		}

		// Renvoi une Array avec une classe en fonction d un ID donne
		public function getClassById($_DB, $id){
			return $_DB->getClassById($id);
		}

		// Met a jour une competence en fonction d un ID donne
		public function updateClass($_DB, $id, $name, $orientationId){
			// Si le nom n est pas vide...
			if($name != ''){
				// Mise a jour de la competence
				$_DB->updateClass($id, $name, $orientationId);
			}
		}
	}
?>
