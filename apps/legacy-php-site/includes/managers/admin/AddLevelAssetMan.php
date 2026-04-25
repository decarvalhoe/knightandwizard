<?php
	class AddLevelAssetMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoie une Array contenant tout les atouts
		public function getAllAssets($_DB){
			return $_DB->getAllAssets('name');
		}

		// Renvoie une Array contenant toutes les classes
		public function getAllClasses($_DB){
			return $_DB->getAllClasses();
		}

		// Renvoie une Array contenant toutes les orientations
		public function getAllOrientations($_DB){
			return $_DB->getAllOrientations();
		}

		// Renvoi une Array contenant toutes les races
		public function getAllRaces($_DB){
			return $_DB->getAllRaces('name');
		}

		// Insert un nouvel atout de niveau dans la DB
		public function insertLevelAsset($_DB, $assetId, $level, $points, $orientationId, $classId, $raceId, $specialCondition){
			$_DB->insertAssetsMergeLevels($assetId, $level, $points, $orientationId, $classId, $raceId, $specialCondition);
		}
	}
?>
