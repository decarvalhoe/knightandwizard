<?php
	class LandMapMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi toutes les villes et villages d un pays en fonction d un ID donne
		public function getCitiesAndTownsByLandId($_DB, $id){
			return $_DB->getPlacesByMotherId($id);
		}

		// Renvoi une place contenue dans une Arrray en fonction d un ID donne
		public function getPlaceById($_DB, $id){
			return $_DB->getPlaceById($id);
		}
	}
?>
