<?php
	class CityMapMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une place contenue dans une Arrray en fonction d un ID donne
		public function getPlaceById($_DB, $id){
			return $_DB->getPlaceById($id);
		}

		// Renvoi toutes les villes et villages d un pays en fonction d un ID donne
		public function getPlacesByMotherId($_DB, $id){
			return $_DB->getPlacesByMotherId($id);
		}
	}
?>
