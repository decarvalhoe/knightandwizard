<?php
	class UpdateAssetMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant un atout en fonction d un ID donne
		public function getAssetById($_DB, $id){
			return $_DB->getAssetById($id);
		}

		// Met a jour un sort
		public function updateAsset($_DB, $id, $name, $effect, $activation, $unitId, $value, $isOrientationAsset, $isClassAsset){
			// Controles de securite
			if($name != ''){
				// Update de l atout dans la DB
				$_DB->updateAsset($id, $name, $effect, $activation, $unitId, $value, $isOrientationAsset, $isClassAsset);
			}
		}
	}
?>
