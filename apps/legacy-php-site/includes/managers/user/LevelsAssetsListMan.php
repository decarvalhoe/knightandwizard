<?php
	class LevelsAssetsListMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoie une Array contenant tous les atouts de niveaux
		public function getAllLevelsAssets($_DB){
			$assetsMergeLevelsArray = $_DB->getAllAssetsMergeLevels();

			$levelsAssetsArray = array();

			foreach ($assetsMergeLevelsArray as $assetsMergeLevels) {
				$asset = $_DB->getAssetById($assetsMergeLevels['assetId']);

				if($assetsMergeLevels['orientationId'] != 0){
					$orientation = $_DB->getOrientationById($assetsMergeLevels['orientationId']);
				}else{
					$orientation = array();
				}

				if($assetsMergeLevels['classId'] != 0){
					$class = $_DB->getClassById($assetsMergeLevels['classId']);
				}else{
					$class = array();
				}

				if($assetsMergeLevels['raceId'] != 0){
					$race = $_DB->getRaceById($assetsMergeLevels['raceId']);
				}else{
					$race = array();
				}

				$customAsset = array();

				$customAsset['id'] = $asset['id'];
				$customAsset['name'] = $asset['name'];
				$customAsset['effect'] = $asset['effect'];
				$customAsset['activation'] = $asset['activation'];
				$customAsset['unitId'] = $asset['unitId'];
				$customAsset['level'] = $assetsMergeLevels['level'];
				$customAsset['points'] = $assetsMergeLevels['points'];
				$customAsset['orientation'] = $orientation['name'];
				$customAsset['class'] = $class['name'];
				$customAsset['race'] = $race['name'];
				$customAsset['specialCondition'] = $assetsMergeLevels['specialCondition'];

				array_push($levelsAssetsArray, $customAsset);
			}

			$i = 0;

			// Passage des atouts avec leur nom en index
			foreach ($levelsAssetsArray as $levelAsset){
				// Ajout des atouts a l Array mais avec le nom en index
				$levelsAssetsArray[$levelAsset['name'] . '-' . $levelAsset['race']  . '-' . $levelAsset['orientation'] . '-' . $levelAsset['class']  . '-' . $levelAsset['id']]  = $levelAsset;

				// Suppression de l asset ayant un numero comme index
				unset($levelsAssetsArray[$i]);

				$i++;
			}

			// Tri de l array en fonction de l index (soit du nom des atouts)
			ksort($levelsAssetsArray);

			$finalLevelsAssetsArray = array();

			// Passage de l array avec des index numerique
			foreach ($levelsAssetsArray as $levelAsset) {
				array_push($finalLevelsAssetsArray, $levelAsset);
			}

			return $finalLevelsAssetsArray;
		}

		// Renvoie le niveau max d une Array ou des atouts de niveaux sont proposes
		public function getLevelMax($levelsAssetsArray){
			$maxLevel = 1;

			foreach ($levelsAssetsArray as $levelAsset) {
				if($levelAsset['level'] > $maxLevel){
					$maxLevel = $levelAsset['level'];
				}
			}

			return $maxLevel;
		}
	}
?>
