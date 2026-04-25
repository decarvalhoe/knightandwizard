<?php
	class UpdateCharacterMan{
		// Constructeur de la classe
		public function __construct(){
		}

		/*
		*	PRIVATE
		*/

		//Verification que le personnage appartienne bien au joueur
		private function checkCharacterOwner($_DB, $characterId, $userId){
			//Verification que le personnage appartienne bien au joueur
			$Character = $_DB->getCharacterByIdAndUserId($characterId, $userId);

			if(!empty($Character)){
				$flag = 1;
			}else{
				$flag = 0;
			}

			return $flag;
		}

		// Formate une string
		private function formatString($string){
			$string = addslashes($string);

			return $string;
		}

		/*
		*	PUBLIC
		*/

		// Ajoute un atout a un personnage
		public function addCharacterAsset($_DB, $User, $Character, $assetId, $assetPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $User->id);

			if($flag == 1){
				// Recuperation de l atout
				$asset = $_DB->getAssetById($assetId);

				// Si l atout n est pas incremental on l ajoute directement au atout du personnage
				if($asset['unitId'] != 2 && $asset['unitId'] != 3){
					// Insert de l atout du perso dans la DB
					$_DB->insertCharacterAsset($Character->id, $asset['id'], $assetPoints);
				}else{ // Sinon, verification que le personnage ne possede pas deja cet atout
					// Check si le personnage possede deja l atout
					$flag = FALSE;

					foreach ($Character->assets as $characterAsset) {
						if($asset['id'] == $characterAsset['id']){
							$flag = TRUE;

							$assetPoints = $characterAsset['points'] + $assetPoints;
						}
					}

					// Insert de l atout du perso dans la DB
					if($flag == FALSE){		// Si le perso ne possede pas encore cet atout...
						$_DB->insertCharacterAsset($Character->id, $asset['id'], $assetPoints);
					}else{					// Si le perso possede deja cet atout...
						$_DB->updateCharacterAsset($asset['id'], $Character->id, $assetPoints);
					}
				}
			}
		}

		// Ajoute un atout de niveau a un personnage
		public function addCharacterLevelAsset($_DB, $User, $Character, $assetMergeLevelId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $User->id);

			if($flag == 1){
				// Recuperation de l atout de niveau
				$assetMergeLevel = $_DB->getAssetMergeLevelById($assetMergeLevelId);
				$asset = $_DB->getAssetById($assetMergeLevel['assetId']);

				$levelAsset = array();

				$levelAsset['id'] = $asset['id'];
				$levelAsset['name'] = $asset['name'];
				$levelAsset['effect'] = $asset['effect'];
				$levelAsset['activation'] = $asset['activation'];
				$levelAsset['unitId'] = $asset['unitId'];
				$levelAsset['level'] = $assetMergeLevel['level'];
				$levelAsset['points'] = $assetMergeLevel['points'];
				$levelAsset['orientation'] = $assetMergeLevel['orientation'];
				$levelAsset['class'] = $assetMergeLevel['class'];
				$levelAsset['specialCondition'] = $assetMergeLevel['specialCondition'];

				// Si l atout n est pas incremental on l ajoute directement aux atouts du personnage
				if($levelAsset['unitId'] != 2 && $levelAsset['unitId'] != 3){
					// Insert de l atout du perso dans la DB
					$_DB->insertCharacterAsset($Character->id, $levelAsset['id'], $levelAsset['points']);
				}else{ // Sinon, verification que le personnage ne possede pas deja cet atout
					// Check si le personnage possede deja l atout
					$flag = FALSE;

					foreach ($Character->assets as $asset) {
						if($levelAsset['id'] == $asset['id']){
							$flag = TRUE;

							$points = $asset['points'] + $levelAsset['points'];
						}
					}

					// Insert de l atout du perso dans la DB
					if($flag == FALSE){		// Si le perso ne possede pas encore cet atout...
						$_DB->insertCharacterAsset($Character->id, $levelAsset['id'], $levelAsset['points']);
					}else{
						// Si le perso possede deja cet atout...
						$_DB->updateCharacterAsset($levelAsset['id'], $Character->id, $points);
					}
				}
			}
		}

		// Ajoute des points de competence dans de nouvelle competence a un personnage en fonction des ID
		public function addCharacterSkills($_DB, $User, $characterId, $skillsArray){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				foreach ($skillsArray as $skill) {
					$_DB->insertCharacterSkill($characterId, $skill);
				}
			}
		}

		// Ajoute des points de sort dans de nouveaux sort a un personnage en fonction des ID
		public function addCharacterSpells($_DB, $User, $characterId, $spellsArray){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				foreach ($spellsArray as $spell) {
					$_DB->insertCharacterSpell($characterId, $spell['id'], $spell['points']);
				}
			}
		}

		// Supprime un personnage donne de la DB
		public function deleteCharacter($_DB, $User, $Character){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $User->id);

			if($flag == 1){
				// Suppression du personnage dans la table "character"
				$_DB->deleteCharacter($Character->id);

				// Suppression du personnage dans la table "characters_merge_skills"
				$_DB->deleteCharacterSkills($Character->id);

				// Suppression du personnage dans la table "assets_merge_characters"
				$_DB->deleteCharacterAssets($Character->id);

				// Suppression du personnage dans la table "characters_merge_spells"
				$_DB->deleteCharacterSpells($Character->id);
			}
		}

		// Suprime un atout d un personnage en fonction d ID donnes
		public function deleteCharacterAsset($_DB, $User, $Character, $assetId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $User->id);

			if($flag == 1){
				// Suppression du personnage dans la table "characters_merge_skills"
				$_DB->deleteCharacterAsset($Character->id, $assetId);
			}
		}

		// Supprime une compentence d un personnage en fonction d ID donnes
		public function deleteCharacterSkill($_DB, $User, $Character, $skillId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $User->id);

			if($flag == 1){
				// Suppression du personnage dans la table "characters_merge_skills"
				$_DB->deleteCharacterSkill($Character->id, $skillId);
			}
		}

		// Renvoi une array contenant tout les genres accessible a un personnage
		public function getAllGenders($_DB, $Character){
			return $_DB->getAllGenders();
		}

		// Renvoie une array contenant toutes les places
		public function getAllPlaces($_DB){
			return $_DB->getAllPlaces();
		}

		// Renvoie une array contenant tous les status
		public function getAllStatus($_DB){
			return $_DB->getAllStatus();
		}

		// Renvoie une array contenant tout les  spells accessibles a un personnage
		public function getAvailableAssets($_DB, $Character){
			$assetsMergeLevelsArray = $_DB->getAllAssetsMergeLevels();

			$levelsAssetsArray = array();

			// Definition du niveau de polyvalence du personnage
			$polyvalence = 0;

			foreach ($Character->assets as $asset) {
				if($asset['id'] == 187){
					$polyvalence = $asset['points'] + 1;
				}
			}

			foreach ($assetsMergeLevelsArray as $assetsMergeLevels) {
				if($assetsMergeLevels['level'] <= $Character->level){	// Filtre des atouts de niveau superieur au niveau du personnage
					// Recuperation de l atout
					$asset = $_DB->getAssetById($assetsMergeLevels['assetId']);

					// Filtres d atouts
					$available = TRUE;

					// Definition de la race liee a l atout
					if($assetsMergeLevels['raceId'] != 0 && $available = TRUE){
						$race = $_DB->getRaceById($assetsMergeLevels['raceId']);
					}else{
						$race = 0;
					}

					// Filtre de la race
					if($race != 0 && $race['id'] != $Character->race['id']){
						$available = FALSE;
					}

					// Definition de l orientation
					if($assetsMergeLevels['orientationId'] != 0 && $available = TRUE){
						$orientation = $_DB->getOrientationById($assetsMergeLevels['orientationId']);
					}else{
						$orientation = 0;
					}

					// Filtre de l orientation
					if($orientation != 0 && $orientation['id'] != $Character->orientation['id'] && $assetsMergeLevels['level'] > $polyvalence){
						$available = FALSE;
					}

					// Definition de la classe
					if($assetsMergeLevels['classId'] != 0  && $available = TRUE){
						$class = $_DB->getClassById($assetsMergeLevels['classId']);
					}else{
						$class = 0;
					}

					// Filtre des classes
					if($class != 0 && $class['id'] != $Character->class['id']){
						$available = FALSE;
					}

					if($available == TRUE){
						$customAsset = array();

						$customAsset['id'] = $asset['id'];
						$customAsset['name'] = $asset['name'];
						$customAsset['effect'] = $asset['effect'];
						$customAsset['activation'] = $asset['activation'];
						$customAsset['unitId'] = $asset['unitId'];
						$customAsset['assetMergeLevelId'] = $assetsMergeLevels['id'];
						$customAsset['level'] = $assetsMergeLevels['level'];
						$customAsset['points'] = $assetsMergeLevels['points'];
						$customAsset['race'] = $race['name'];
						$customAsset['orientation'] = $orientation['name'];
						$customAsset['class'] = $class['name'];
						$customAsset['specialCondition'] = $assetsMergeLevels['specialCondition'];

						array_push($levelsAssetsArray, $customAsset);
					}
				}
			}

			// Passage des atouts avec leur nom en index
			$i = 0;

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

			// Creation d une array pour stocker les atouts accessible au personnage
			$newAssetsArray = array();

			foreach ($finalLevelsAssetsArray as $asset) {
				// Suppression de l atout si le personnage le possede deja et qu il n est pas incremental
				$flagAlreadyHave = FALSE;

				foreach ($Character->assets as $characterAsset) {
					if($characterAsset['unitId'] != 2 & $characterAsset['id'] == $asset['id'] &&
						$characterAsset['unitId'] != 3 & $characterAsset['id'] == $asset['id']){
						$flagAlreadyHave = TRUE;
					}
				}

				if($flagAlreadyHave == FALSE){
					array_push($newAssetsArray, $asset);
				}
			}

			return $newAssetsArray;
		}

		// Renvoie une array contenant toutes les classes accessible a un personnage
		public function getAvailableClasses($_DB, $Character){
			return $_DB->getClassesByOrientationId($Character->orientation['id']);
		}

		// Renvoie une array contenant les atouts neutres accessiblent a un personnages
		public function getAvailableNeutralAssets($_DB, $Character){
			// Recuperation de tous les atouts dans la DB
			$assetsArray = $_DB->getAllAssets('name');

			// Definition de l array finale a renvoyer
			$finalAssetsArray = array();

			// Filtre des atouts d orientation et de classes
			foreach ($assetsArray as $asset) {
				if($asset['isOrientationAsset'] == 0 && $asset['isClassAsset'] == 0){
					array_push($finalAssetsArray, $asset);
				}
			}

			// Filtre des atouts deja posseder par le personnage
			foreach ($Character->assets as $characterAsset) {
				if($characterAsset['isOrientationAsset'] == 0 &&	// Si l atout n est pas un atout d orientation et que...
					$characterAsset['isClassAsset'] == 0 &&			// L atout n est pas un atout de classe et que...
					$characterAsset['unitId'] != 2 &&				// L atout n est pas un atout a prise multiple (points) et que...
					$characterAsset['unitId'] != 3					// L atout n est pas un atout a prise multiple (%)...
				){													// Alors on cherche dans la liste des atout pour supprimer le doublons

					$tempAssetsArray = array();

					foreach ($finalAssetsArray as $asset) {
						if($characterAsset['id'] != $asset['id']){
							array_push($tempAssetsArray, $asset);
						}
					}

					$finalAssetsArray = $tempAssetsArray;
				}
			}

			return $finalAssetsArray;
		}

		// Renvoie une array contenant toutes les orientations accessible a un personnage
		public function getAvailableOrientations($_DB, $Character){
			return $_DB->getAllOrientations();
		}

		// Renvoie une array contenant tout les races accessible a un personnage
		public function getAvailableRaces($_DB, $Character){
			return $_DB->getAllRaces('name');
		}

		// Renvoie une array contenant toutes les skills accessibles a un personnage
		public function getAvailableSkills($_DB, $Character){
			// Recuperation de toute les familles de competences
			$skillsFamiliesArray = $_DB->getAllSkillsFamilies();

			// Definition de l Array a renvoyer
			$skillsArray = array();

			foreach ($skillsFamiliesArray as $skillsFamily){
				// Recuperation de toutes les competences d une famille de competences
				$newSkillsArray = $_DB->getSkillsBySkillsFamilyId($skillsFamily['id']);

				$newSkillArray = array();

				foreach ($newSkillsArray as $newSkill) {
					// Flag determinant si on ne doit pas ajouter cette competence
					$addThisSkill = TRUE;

					// Suppression de la competence si le personnage la possede deja
					foreach ($Character->skills as $characterSkill) {
						if($characterSkill['id'] == $newSkill['id']){
							$addThisSkill = FALSE;
						}
					}

					// Suppresion de la competence Vol pour les personnage qui ne volent pas
					if($addThisSkill == TRUE && $newSkill['id'] == 270){
						$addThisSkill = FALSE;

						foreach ($Character->assets as $asset) {
							if($asset['id'] == 4){
								$addThisSkill = TRUE;
							}
						}
					}

					// Ajout de la competence si elle a passer tout les filtres
					if($addThisSkill == TRUE){
						$newSkill['familyName'] = $skillsFamily['name'];

						array_push($newSkillArray, $newSkill);
					}
				}

				array_push($skillsArray, $newSkillArray);
			}

			return $skillsArray;
		}

		// Renvoie une array contenant tout les  spells accessibles a un personnage
		public function getAvailableSpells($_DB, $Character){
			$spellsArray = $_DB->getAllSpells('type_id');

			$newSpellsArray = array();

			foreach ($spellsArray as $spell) {
				// Suppression du sort si le personnage le possede deja
				$flagAlreadyHave = FALSE;

				foreach ($Character->spells as $characterSpell) {
					if($characterSpell['id'] == $spell['id']){
						$flagAlreadyHave = TRUE;
					}
				}

				if($flagAlreadyHave == FALSE){
					array_push($newSpellsArray, $spell);
				}
			}

			return $newSpellsArray;
		}

		// Renvoie un objet personnage en fonction d un ID donne
		public function getCharacterById($_DB, $id){
			return $_DB->getCharacterById($id);
		}

		// Renvoie une array contenant toutes les infos d une competence liee a un personnage
		public function getCharacterSkillById($_DB, $Character, $skillId, $userId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $userId);

			if($flag == 1){
				// Recuperation de la competence
				$skillArray = $_DB->getCharacterSkillById($Character->id, $skillId);
			}else{
				$skillArray = array();
			}

			return $skillArray;
		}

		// Renvoi une array contenant toutes les infos d un sort liee a un personnage
		public function getCharacterSpellById($_DB, $Character, $spellId, $userId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $Character->id, $userId);

			if($flag == 1){
				// Recuperation de la competence
				$spellArray = $_DB->getCharacterSpellById($Character->id, $spellId);
			}else{
				$spellArray = array();
			}

			return $spellArray;
		}

		// Renvoie le niveau max d une Array ou des atouts de niveaux sont proposes
		public function getLevelsAssetsMax($levelsAssetsArray){
			$maxLevel = 1;

			foreach ($levelsAssetsArray as $levelAsset) {
				if($levelAsset['level'] > $maxLevel){
					$maxLevel = $levelAsset['level'];
				}
			}

			return $maxLevel;
		}

		// Renvoi une array contenant une skill en fonction d un ID donne
		public function getSkillById($_DB, $id){
			return $_DB->getSkillById($id);
		}

		// Renvoi l ID max de la table skills
		public function getSkillsMaxId($_DB){
			return $_DB->getSkillsMaxId();
		}

		// Renvoi l ID max de la table spells
		public function getSpellsMaxId($_DB){
			return $_DB->getSpellsMaxId();
		}

		// Met a jour les points d attribut d un personnage en fonction d un ID donne
		public function updateCharacterAttribute($_DB, $User, $characterId, $attributeName, $attributeValue){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$newName = $this->formatString($newName);

				$_DB->updateCharacterAttribute($characterId, $attributeName, $attributeValue);
			}
		}

		// Met a jour les points d un atout d un personnage en fonction d un ID donne
		public function updateCharacterAsset($_DB, $User, $characterId, $assetId, $assetPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				// Mise a jour de la competence
				$_DB->updateCharacterAsset($assetId, $characterId, $assetPoints);
			}
		}

		// Met a jour la classe d un personnage en fonction d un ID donne
		public function updateCharacterClass($_DB, $User, $characterId, $classId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterClass($characterId, $classId);
			}
		}

		// Met a jour les points de vitalite max d un personnage en fonction d un ID donne
		public function updateCharacterEnergyMax($_DB, $User, $characterId, $energyMaxPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				// Controle de securite pour assure qu il n y a pas de points d energie negatifs et que les points soient bien de type numerique
				if($energyMaxPoints < 0 || is_numeric($energyMaxPoints) == FALSE){
					$energyMaxPoints = 0;
				}

				$_DB->updateCharacterEnergyMax($characterId, $energyMaxPoints);
			}
		}

		// Met a jour le genre d un personnage en fonction d un ID donne
		public function updateCharacterGender($_DB, $User, $characterId, $genderId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterGender($characterId, $genderId);
			}
		}

		// Met a jour le nom d un personnage en fonction d un ID donne
		public function updateCharacterName($_DB, $User, $characterId, $newName){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$newName = $this->formatString($newName);

				$_DB->updateCharacterName($characterId, $newName);
			}
		}

		// Met a jour les d un personnage en fonction d un ID donne
		public function updateCharacterNote($_DB, $User, $characterId, $note){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$note = $this->formatString($note);

				$_DB->updateCharacterNote($characterId, $note);
			}
		}

		// Met a jour la race d un personnage en fonction d un ID donne
		public function updateCharacterOrientation($_DB, $User, $characterId, $orientationId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterOrientation($characterId, $orientationId);
			}
		}

		// Met a jour la place d un personnage en fonction d un ID donne
		public function updateCharacterPlace($_DB, $User, $characterId, $placeId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterPlace($characterId, $placeId);
			}
		}

		// Met a jour la race d un personnage en fonction d un ID donne
		public function updateCharacterRace($_DB, $User, $characterId, $raceId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterRace($characterId, $raceId);
			}
		}

		// Met a jour les points d une competence d un personnage en fonction d ID donne
		public function updateCharacterSkill($_DB, $User, $characterId, $skillId, $skillPoints, $isMain){
			
			
		
			
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				if($skillPoints > 0){
					// Si la competence est primaire...
					if($isMain == 1){
						// Check des competences du perso pour supprimer l eventuel doublon de competences primaires
						$characterSkillsArray = $_DB->getCharacterSkillsByCharacterId($characterId);

						foreach ($characterSkillsArray as $skill) {
							if($skill['isMain'] == 1){
								$_DB->updateCharacterSkill($characterId, $skill['id'], $skill['points'], 0);
							}
						}
					}else{
						$isMain = 0;
					}
				
					// Mise a jour de la competence
					$_DB->updateCharacterSkill($characterId, $skillId, $skillPoints, $isMain);
				}else{
					$_DB->deleteCharacterSkill($characterId, $skillId);
				}
			}
		}

		// Met a jour les points d un sort d un personnage en fonction d ID donne
		public function updateCharacterSpell($_DB, $User, $characterId, $spellId, $spellPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				if($spellPoints > 0){
					$_DB->updateCharacterSpell($characterId, $spellId, $spellPoints);
				}else{
					$_DB->removeCharacterSpell($characterId, $spellId);
				}
			}
		}

		// Met a jour le facteur de vitesse d un personnage en fonction d un ID donne
		public function updateCharacterSpeedFactor($_DB, $User, $characterId, $speedFactorPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				// Controle de securite pour assure qu il n y a pas de points de vitalite negatifs
				if($speedFactorPoints < 1){
					$vitalityMaxPoints = 1;
				}

				$_DB->updateCharacterSpeedFactor($characterId, $speedFactorPoints);
			}
		}

		// Met a jour le status d un personnage en fonction d un ID donne
		public function updateCharacterStatus($_DB, $User, $characterId, $statusId){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				$_DB->updateCharacterStatus($characterId, $statusId);
			}
		}

		// Met a jour les points de vitalite max d un personnage en fonction d un ID donne
		public function updateCharacterVitalityMax($_DB, $User, $characterId, $vitalityMaxPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				// Controle de securite pour assure qu il n y a pas de points de vitalite negatifs
				if($vitalityMaxPoints < 1){
					$vitalityMaxPoints = 1;
				}

				$_DB->updateCharacterVitalityMax($characterId, $vitalityMaxPoints);
			}
		}

		// Met a jour le facteur de volonte d un personnage en fonction d un ID donne
		public function updateCharacterWillFactor($_DB, $User, $characterId, $willFactorPoints){
			// Verification de propriete du personnage par le joueur
			$flag = $this->checkCharacterOwner($_DB, $characterId, $User->id);

			if($flag == 1){
				// Controle de securite pour assure qu il n y a pas de points de vitalite negatifs
				if($willFactorPoints < 1){
					$willFactorPoints = 1;
				}

				$_DB->updateCharacterWillFactor($characterId, $willFactorPoints);
			}
		}
	}
?>
