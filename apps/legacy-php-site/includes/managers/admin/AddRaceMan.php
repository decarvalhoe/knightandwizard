<?php
	class AddRaceMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi l ID max de la table assets
		public function getAssetsMaxId($_DB){
			return $_DB->getAssetsMaxId();
		}

		// Renvoi une Array contenant tous les atouts accessible aux races (sans les atouts de classe ni d orientation)
		public function getRacesAssets($_DB){
			return $_DB->getRacesAssets();
		}

		// Ajoute un atout dans la DB
		public function insertRace($_DB, $name, $category, $vitality, $speedFactor, $willFactor, $strengthMax,
									$dexterityMax, $staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax,
									$perceptionMax, $reflexesMax, $assetsArray){
			// Tests de securites
			if($name != ''){
				// Ajout de l atout dans la DB
				$_DB->insertRace($name, $category, $vitality, $speedFactor, $willFactor, $strengthMax, $dexterityMax,
									$staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax,
									$perceptionMax, $reflexesMax, $assetsArray);
			}
		}
	}
?>
