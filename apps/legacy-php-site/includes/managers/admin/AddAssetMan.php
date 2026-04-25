<?php
	class AddAssetMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoie une Array contenant toutes les classes disponnibles
		public function getAllClasses($_DB){
			return $_DB->getAllClasses();
		}

		// Renvoie une Array contenant toutes les orientations disponibles
		public function getAllOrientations($_DB){
			return $_DB->getAllOrientations();
		}

		// Ajoute un atout dans la DB
		public function insertAsset($_DB, $name, $effect, $activation, $unitId, $value, $isOrientationAsset, $orientationId, $isClassAsset, $classId){
			// Tests de securites
			if($name != ''){
				// Ajout de l atout dans la DB
				$_DB->insertAsset($name, $effect, $activation, $unitId, $value, $isOrientationAsset, $isClassAsset);

				if($isOrientationAsset == TRUE && $orientationId != ''){	// Ajout des data dans la table relationnelle d atout d orientations
					// Recuperation de l ID de l atout
					$assetId = $_DB->getAssetsMaxId();

					// Insert des data d atout d orientation
					$_DB->insertAssetMergeOrientation($assetId, $orientationId, 2);
				}elseif ($isClassAsset == TRUE && $classId != '') {			// Ajout des data dans la table relationnelle d atout de classe
					// Recuperation de l ID de l atout
					$assetId = $_DB->getAssetsMaxId();

					// Insert des data d atout d orientation
					$_DB->insertAssetMergeClass($assetId, $classId);
				}
			}
		}
	}
?>
