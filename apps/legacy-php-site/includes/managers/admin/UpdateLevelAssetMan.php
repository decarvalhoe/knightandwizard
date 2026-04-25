<?php
	class UpdateLevelAssetMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renoi une array contenant toutes les classes
		public function getAllClasses($_DB){
			return $_DB->getAllClasses();
		}

		// Renoi une array contenant toutes les orientations
		public function getAllOrientations($_DB){
			return $_DB->getAllOrientations();
		}

		// Renoi une array contenant toutes les races triee selon un ordre donne
		public function getAllRaces($_DB, $order){
			return $_DB->getAllRaces($order);
		}

		// Renvoi une Array contenant un atout en fonction d un ID donne
		public function getAssetMergeLevel($_DB, $id){
			return $_DB->getAssetMergeLevelById($id);
		}

		// Renvoie une Array contenant tous les atouts de niveaux
		public function getAsset($_DB, $id){
			return $_DB->getAssetById($id);
		}

		// Met a jour un "asset_merge_level"
		public function updateAssetMergeLevel($_DB, $id, $level, $points, $raceId, $orientationId, $classId, $specialCondition){
			$_DB->updateAssetMergeLevel($id, $level, $points, $raceId, $orientationId, $classId, $specialCondition);
		}
	}
?>
