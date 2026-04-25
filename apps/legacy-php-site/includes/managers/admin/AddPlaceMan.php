<?php
	class AddPlaceMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi tout les lieux existant dans une Array
		public function getAllPlaces($_DB){
			return $_DB->getAllPlaces();
		}

		// Renvoi tout les status de lieu existant dans une Array
		public function getAllPlacesStatus($_DB){
			return $_DB->getAllPlacesStatus();
		}

		// Insert un lieu dans la DB
		public function insertPlace($_DB, $name, $isChildOf, $statusId, $isCapital){
			// Formatge
			if($isCapital != 1){
				$isCapital = 0;
			}

			$_DB->insertPlace($name, $isChildOf, $statusId, $isCapital);
		}
	}
?>
