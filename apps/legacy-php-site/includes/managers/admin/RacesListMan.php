<?php
	class RacesListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array composee de toutes les races
		public function getAllRaces($_DB, $order){
			$racesArray = $_DB->getAllRaces($order);
			
			return $racesArray;
		}
	}
?>
