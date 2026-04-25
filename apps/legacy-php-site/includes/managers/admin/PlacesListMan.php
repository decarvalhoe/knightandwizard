<?php
	class PlacesListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi tous les lieux contenu dans une array
		public function getAllplaces($_DB){
			return $_DB->getAllPlaces();
		}
	}
?>
