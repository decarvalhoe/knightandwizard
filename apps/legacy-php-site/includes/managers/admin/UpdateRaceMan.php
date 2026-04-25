<?php
	class UpdateRaceMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi le plus grand ID de la table assets
		public function getAssetsMaxId($_DB){
			return $_DB->getAssetsMaxId();
		}

		// Renvoi une Array contenant tous les atouts accessible aux races (sans les atouts de classe ni d orientation)
		public function getRacesAssets($_DB){
			return $_DB->getRacesAssets();
		}

		// Renvoi une Array contenant une race en fonction d un ID donne
		public function getRaceById($_DB, $id){
			return $_DB->getRaceById($id);
		}

		// Met a jour un sort
		public function updateRace($_DB, $id, $name, $category, $vitality, $speedFactor, $willFactor, $strengthMax, $dexterityMax, $staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax, $perceptionMax, $reflexesMax, $assetsArray){
			// Controles de securite
			if($name != ''){
				// Update de l atout dans la DB
				$_DB->updateRace($id, $name, $category, $vitality, $speedFactor, $willFactor, $strengthMax, $dexterityMax, $staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax, $perceptionMax, $reflexesMax);
			}

			// Effacement des atouts lies a une race
			$_DB->removeRaceAssetsById($id);

			// Insert des atouts de race
			foreach ($assetsArray as $assetArray){
				$_DB->insertRaceAssets($id, $assetArray['id'], $assetArray['points']);
			}
		}
	}
?>
