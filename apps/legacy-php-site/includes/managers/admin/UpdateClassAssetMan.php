<?php
	class UpdateClassAssetMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une array contenant une classe en fonction d un ID donne
		public function getClassById($_DB, $id){
			return $_DB->getClassById($id);
		}

		// Renvoi une array contenant une orientation en fonction d un ID donne
		public function getOrientationById($_DB, $id){
			return $_DB->getOrientationById($id);
		}

		// Renvoie une array contenant tous les atouts de classe
		public function getAllClassesAssets($_DB){
			return $_DB->getAllClassesAssets();
		}

		// Met a jour l atout de classe en fonction d ID donnes
		public function updateClassAsset($_DB, $classId, $assetId){
			$_DB->updateClassAsset($classId, $assetId);
		}
	}
?>
