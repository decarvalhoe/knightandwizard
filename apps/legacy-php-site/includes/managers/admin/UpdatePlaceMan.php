<?php
	class UpdatePlaceMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant tous les lieux
		public function getAllPlaces($_DB){
			return $_DB->getAllPlaces();
		}

		// Renvoi tous les status de lieu dans une array
		public function getAllPlacesStatus($_DB){
			return $_DB->getAllPlacesStatus();
		}

		// Renvoi un lieu en fonction d un ID donne
		public function getPlaceById($_DB, $id){
			return $_DB->getPlaceById($id);
		}

		// Met a jour un lieu en fonction d un ID donne
		public function updatePlace($_DB, $id, $name, $isChildOf, $statusId, $isCapital){
			$_DB->updatePlace($id, $name, $isChildOf, $statusId, $isCapital);
		}
	}
?>
