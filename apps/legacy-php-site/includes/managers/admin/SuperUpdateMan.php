<?php
	class SuperUpdateMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Ajoute les atouts de classe pour tous les personnages existant dans la DB
		public function addClassesAssetsToCharacters($_DB){
			$CharactersArray = $_DB->getAllCharacters();

			foreach($CharactersArray as $Character){
				if(!empty($Character->class)){
					// Recuperation de l atout d orientation
					$classAsset = $_DB->getAssetByClassId($Character->class['id']);

					$_DB->insertCharacterAsset($Character->id, $classAsset['id'], 0);
				}
			}
		}

		// Ajout des facteurs de vitesse, de volonte, de la vitalite et de la vitalite MAX pour tout les personnage existants
		public function addFactorsAndVitality($_DB){
			$CharactersArray = $_DB->getAllCharacters();

			foreach($CharactersArray as $Character){
				if(!empty($Character->race)){
					// Mise a jour du personnage
					$_DB->updateCharacterSpeedFactor($Character->id, $Character->race['speedFactor']);
					$_DB->updateCharacterWillFactor($Character->id, $Character->race['willFactor']);
					$_DB->updateCharacterVitality($Character->id, $Character->race['vitality']);
					$_DB->updateCharacterVitalityMax($Character->id, $Character->race['vitality']);
				}
			}
		}

		// Ajoute les atouts d orientation pour tout les personnages existants dans la DB
		public function addOrientationsAssetsToCharacters($_DB){
			$CharactersArray = $_DB->getAllCharacters();

			foreach ($CharactersArray as $Character) {
				if(!empty($Character->orientation)){
					// Recuperation de l atout d orientation
					$orientationAsset = $_DB->getAssetByOrientationId($Character->orientation['id']);

					if($orientationAsset['id'] != 63){
						$_DB->insertCharacterAsset($Character->id, $orientationAsset['id'], 2);
					}else{
						$_DB->insertCharacterAsset($Character->id, $orientationAsset['id'], 0);
					}
				}
			}
		}

		// Ajoute les atouts de races pour tous les personnages existants dans la DB
		public function addRacesAssetsToCharacters($_DB){
			$CharactersArray = $_DB->getAllCharacters();

			foreach ($CharactersArray as $Character) {
				if($Character->id != 18){ // Skip d Androulya
					// Sauvegarde des datas d assets du personnage
					foreach ($Character->race['assets'] as $raceAsset) {
						// Formatage des donnees a transmettre a la DB
						$assetId = $raceAsset['id'];
						$assetPoints = $raceAsset['points'];

						//$_DB->insertCharacterAsset($Character->id, $assetId, $assetPoints);
					}
				}
			}
		}
	}
?>
