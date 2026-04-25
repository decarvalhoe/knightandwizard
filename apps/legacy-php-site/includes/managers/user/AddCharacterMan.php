<?php
	class AddCharacterMan{
		// Constructeur de la classe
		public function __construct(){
		}

		/*
		*	PRIVATES
		*/

		// Definit le type de magie d un ID de class donne
		private function defineMagicType($classId){
			// Definition de l ID du type de magie du magicien
			switch ($classId) {
				case '2':	// Abjurateur
					$magicTypeId = 1;
					break;

				case '3':	// Alterateur
					$magicTypeId = 2;
					break;

				case '4':	// Chaman
					$magicTypeId = 9;
					break;

				case '5':	// Clerc
					$magicTypeId = 3;
					break;

				case '6':	// Devin
					$magicTypeId = 4;
					break;

				case '7':	// Druide
					$magicTypeId = 9;
					break;

				case '8':	// Elementaliste
					$magicTypeId = 5;
					break;

				case '9':	// Enchanteur
					$magicTypeId = 6;
					break;

				case '10':	// Illusionniste
					$magicTypeId = 7;
					break;

				case '11':	// Invocateur
					$magicTypeId = 8;
					break;

				case '12':	// Necromancien
					$magicTypeId = 10;
					break;

				case '13':	// Sorcier
					$magicTypeId = 11;
					break;
			}

			return $magicTypeId;
		}

		// Ajoute une entree aleatoire dans une Array en tete de celle-ci
		private function addRandomIndex($array){
			$randIndex = array_rand($array, 1);

			$randChoice = $array[$randIndex];

			$randChoice['name'] = 'Al&eacute;atoire';

			array_unshift($array, $randChoice);

			return $array;
		}

		/*
		*	PUBLICS
		*/

		// Ajoute un atout a l array d atout d un personnage
		public function addCharacterAsset($_DB, $characterAssetsArray, $levelAssetId){
			// Recuperation de l atout
			$levelAsset = $_DB->getAssetById($levelAssetId);

			// Recuperation des infos complementaires de l atout de niveau
			$assetMergeLevel = $_DB->getAssetsMergeLevelsByAssetId($levelAssetId);

			// Ajout des points a l atout selectionne
			$levelAsset['points'] = $assetMergeLevel['points'];

			$i = 0;

			foreach ($characterAssetsArray as $asset) {
				// Si le personnage possede deja l atout, on incremente celui-ci
				if($asset['id'] == $levelAsset['id']){
					// Addition des points d atouts
					$levelAsset['points'] = $asset['points'] + $levelAsset['points'];

					// Suppression de l asset ayant un numero comme index
					unset($characterAssetsArray[$i]);
				}

				$i++;
			}

			// Attribution de l atout au personnage
			array_push($characterAssetsArray, $levelAsset);

			return $characterAssetsArray;
		}

		// Ajoute le nom des competences a un array de competences (id + points)
		public function getSkillById($_DB, $skillId){
			return $_DB->getSkillById($skillId);
		}

		// Ajoute le nom des competences a un array de competences (id + points)
		public function addSpellsName($_DB, $spellsArray){
			$newSpellsArray = array();

			// Recuperation des competences
			foreach ($spellsArray as $spellArray) {
				$spell = $_DB->getSpellById($spellArray['id']);

				// Ajout du nombre de points
				$spell['points'] = $spellArray['points'];

				array_push($newSpellsArray, $spell);
			}

			return $newSpellsArray;
		}

		// Formate une string
		public function formatString($string){
			return addslashes($string);
		}

		// Renvoi une array contenant tout les genres ainsi que leur ID
		public function getAllGenders($_DB){
			// Recuperation des genres existants
			$gendersArray = $_DB->getAllGenders();

			// Ajout du genre aleatoire
			$gendersArray = $this->addRandomIndex($gendersArray);

			return $gendersArray;
		}

		// Renoie une array contenant un atout en fonction d un ID donne
		public function getAssetById($_DB, $assetId){
			return $_DB->getAssetById($assetId);
		}

		// Renvoit l ID max de la table Assets
		public function getAssetsMaxId($_DB){
			return $_DB->getAssetsMaxId();
		}

		// Renvoie une array contenant toutes les classes disponibles pour un personnage donne
		public function getAvailableClasses($_DB, $Character){
			// Recuperation des orientations existantes
			$classesArray = $_DB->getClassesByOrientationId($Character->orientation['id']);

			// Ajout du genre aleatoire
			$classesArray = $this->addRandomIndex($classesArray);

			return $classesArray;
		}

		// Renvoie une array contenant tous les atouts de niveau disponiblent pour un personnage donne
		public function getAvailableLevelAssets($_DB, $Character, $levelProcessing){
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
				if($assetsMergeLevels['level'] <= $levelProcessing){	// Filtre des atouts de niveau superieur au niveau du personnage
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

		// Renvoie une array contenant toutes les orientations disponibles pour un personnage donne
		public function getAvailableOrientations($_DB, $Character){
			// Recuperation des orientations existantes
			$orientationsArray = $_DB->getAllOrientations();

			// Regles de race
			switch ($Character->race['id']) {
				case '8':	// Race = Chat
					$i = 0;

					foreach ($orientationsArray as $orientation){
						if($orientation['id'] == 1 ||		// Suppression de l orientation Magicien
						$orientation['id'] == 2 ||			// Suppression de l orientation Guerrier
						$orientation['id'] == 3 ||			// Suppression de l orientation Artisant
						$orientation['id'] == 4 ||			// Suppression de l orientation Artiste
						$orientation['id'] == 5 ||			// Suppression de l orientation Commercant
						$orientation['id'] == 8 ||			// Suppression de l orientation Malfaisant
						$orientation['id'] == 9 ||			// Suppression de l orientation Intellectuel
						$orientation['id'] == 10 ||			// Suppression de l orientation Ouvrier
						$orientation['id'] == 11 ||			// Suppression de l orientation Ouvrier
						$orientation['id'] == 12){			// Suppression de l orientation Religieux
							unset($orientationsArray[$i]);
						}

						$i++;
					}

					break;
				case '9':	// Race = Cheval
				case '22':	// Race = Loup
					$i = 0;

					foreach ($orientationsArray as $orientation){
						if($orientation['id'] == 1 ||		// Suppression de l orientation Magicien
						$orientation['id'] == 3 ||			// Suppression de l orientation Artisant
						$orientation['id'] == 4 ||			// Suppression de l orientation Artiste
						$orientation['id'] == 5 ||			// Suppression de l orientation Commercant
						$orientation['id'] == 6 ||			// Suppression de l orientation Domestique
						$orientation['id'] == 7 ||			// Suppression de l orientation Hors-la-Loi
						$orientation['id'] == 8 ||			// Suppression de l orientation Malfaisant
						$orientation['id'] == 9 ||			// Suppression de l orientation Intellectuel
						$orientation['id'] == 10 ||			// Suppression de l orientation Ouvrier
						$orientation['id'] == 11 ||			// Suppression de l orientation Paysan
						$orientation['id'] == 12){			// Suppression de l orientation Religieux
							unset($orientationsArray[$i]);
						}

						$i++;
					}

					break;
				case '29':	// Race = Orc
					switch ($Character->gender['id']){
						case '1':		// Genre = Masculin
							$i = 0;

							foreach ($orientationsArray as $orientation) {
								if($orientation['id'] == 1){	// Suppression de l orientation Magicien
									unset($orientationsArray[$i]);
								}

								$i++;
							}

							break;
						default:
							break;
					}

					break;
				default:
					break;
			}

			// Formatage
			$newOrientationsArray = array();

			foreach ($orientationsArray as $orientation){
				array_push($newOrientationsArray, $orientation);
			}

			$orientation = $newOrientationsArray;

			// Ajout du genre aleatoire
			$orientationsArray = $this->addRandomIndex($orientationsArray);

			return $orientationsArray;
		}

		// Renvoie une array contenant toutes les races disponibles pour un personnage donne
		public function getAvailableRaces($_DB, $Character){
			// Recuperation des genres existants
			$racesArray = $_DB->getAllRaces('name');

			switch ($Character->gender['id']) {
				case '1':		// Si le personnage est masculin...
					$i = 0;

					// Suppression des races
					foreach ($racesArray as $race) {
						// Suppression de la race "Ondine"
						if($race['id'] == 11 ||		// Race = Dryade
						$race['id'] == 28){			// Race = Ondine
							unset($racesArray[$i]);
						}

						$i++;
					}

					$newRaceArray = array();

					// Formatage
					foreach ($racesArray as $race) {
						array_push($newRaceArray, $race);
					}

					$racesArray = $newRaceArray;

					break;
				default:
					break;
			}

			// Ajout du genre aleatoire
			$racesArray = $this->addRandomIndex($racesArray);

			return $racesArray;
		}

		// Renvoie une array contenant toutes les competances disponibles pour un personnage donne
		public function getAvailableSkills($_DB, $Character){
			$skillsFamiliesArray = $_DB->getAllSkillsFamilies();

			$skillsArray = array();

			foreach ($skillsFamiliesArray as $skillsFamily){
				$newSkillsArray = $_DB->getSkillsBySkillsFamilyId($skillsFamily['id']);

				$newSkillArray = array();

				foreach ($newSkillsArray as $newSkill) {
					$newSkill['familyName'] = $skillsFamily['name'];

					array_push($newSkillArray, $newSkill);
				}

				array_push($skillsArray, $newSkillArray);
			}

			return $skillsArray;
		}

		// Renvoie une array contenant toutes les sorts disponibles pour un personnage donne
		public function getAvailableSpells($_DB, $Character){
			// Recuperation de tous les sorts
			$spellsArray = $_DB->getAllSpells('type_id');

			// Definition du type de magie du personnage
			$characterMagicType = $this->defineMagicType($Character->class['id']);

			$finalSpellsArray = array();

			foreach ($spellsArray as $spell) {
				if($spell['value'] <= 10000 || $spell['typeId'] == $finalSpellsArray){
					array_push($finalSpellsArray, $spell);
				}
			}

			return $finalSpellsArray;
		}

		// Renvoie une array contenant toutes les infos d une classe en fonction d un ID donne
		public function	getClassById($_DB, $id){
			return $_DB->getClassById($id);
		}

		// Renvoie une array avec toutes les infos d un genre en fonction d un ID donne
		public function getGenderById($_DB, $id){
			return $_DB->getGenderById($id);
		}

		// Renvoie le niveau maximal d atout present dans une Array d atout de niveau
		public function getLevelMaxFromLevelAssetsArray($levelAssetsArray){
			$levelMax = 0;

			foreach ($levelAssetsArray as $levelAsset) {
				if($levelAsset['level'] > $levelMax){
					$levelMax = $levelAsset['level'];
				}
			}

			return $levelMax;
		}

		// Renvoie une array avec toutes les infos d une orientation en fonction d un ID donne
		public function getOrientationById($_DB, $id){
			return $_DB->getOrientationById($id);
		}

		// Renvoie une array avec toutes les infos d une race en fonction d un ID donne
		public function getRaceById($_DB, $id){
			return $_DB->getRaceById($id);
		}

		// Renvoi une Array contenant les atouts de niveau d un personnage avec un atout additionnel choisi aleatoirement
		public function setRandomLevelAsset($_DB, $Character, $levelProcessing){
			// Recuperation de tout les atouts accecible au personnage pour un niveau donne
			$levelAssetsArray = $this->getAvailableLevelAssets($_DB, $Character, $levelProcessing);

			// Selection aleatoire d un index
			$randIndex = array_rand($levelAssetsArray);

			// Definition de l atout de niveau complet
			$levelAsset = $levelAssetsArray[$randIndex];

			// Ajout de l atout a la liste d atout du personnage
			$Character->assets = $this->addCharacterAsset($_DB, $Character->assets, $levelAsset['id']);

			return $Character->assets;
		}

		// Renvoie une Array de competences "aleatoire"
		public function setRandomSkills($_DB, $Character){
			// Recuperation de la liste complete des competences
			$skillsArray = $_DB->getAllSkills();

			// Definition du nombre de points de niveau du personnage
			$levelPointsMin = $Character->race['category'] * $Character->level;
			$levelPointsMax = $Character->race['category'] * ($Character->level + 1) - 1;

			// Definition des points de niveau
			$levelPoints = rand($levelPointsMin, $levelPointsMax);

			// Definition des probabilites dans l attribution des points de competences (en %)
			if($Character->orientation['id'] != 1){		// Classe = Non-Magicien
				$mainSkillProb = 3;		// Competence primaire
				$newSkillProb = 45;		// Nouvelle competence
			}else{										// Classe = Magicien
				$mainSkillProb = 18;	// Competence primaire
				$newSkillProb = 38;		// Nouvelle competence
			}

			$charSkillsArray = array();
			$i = 1;


			/*
			* Ajout de la competence primaire
			*/

			// Si le personnage n est pas un magicien...
			if($Character->orientation['id'] != 1){
				// Definition de la competence primaire (car il peut y en avoir plusieur a choix)
				$primarySkillArrayKey =  array_rand($Character->class['primarySkillsArray']);

				// Definition de l ID de la competence primaire
				$primarySkillId = $Character->class['primarySkillsArray'][$primarySkillArrayKey]['id'];

				// Attribution du premier point dans la competence primaire
				$skillArray = $_DB->getSkillById($primarySkillId);
				$skillArray['points'] = 1;
				$skillArray['isMain'] = 1;

				// Ajout de la nouvelle skill a la liste de skills courrante
				array_push($charSkillsArray, $skillArray);

				// Point compte double
				$i = $i + 2;

				// Suppression de la skill dans la liste totale des skills pour eviter les doublons de competences
				$t = 0;

				foreach ($skillsArray as $skill) {
					if($skill['id'] == $primarySkillId){
						unset($skillsArray[$t]);

						break;
					}

					$t++;
				}

				// Defintion de la liste de skills primaires (competences et specialisations)
				$primarySkillsSpecialisationsArray = array();

				foreach ($skillsArray as $skill) {
					if($skill['isChildOf'] == $skillArray['id']){
						$temp = array('id' => $skill['id'],
										'skillsArrayIndex' => array_search($skill, $skillsArray),
										'alreadyHave' => FALSE);

						array_push($primarySkillsSpecialisationsArray, $temp);
					}
				}

				// Ajout des spec. de spec. de comp. primaire en comp. primaires
				if(count($primarySkillsSpecialisationsArray) > 0){
					$newPrimarySkillsSpecialisationsArray = $primarySkillsSpecialisationsArray;

					do {
						$primarySkillsSpecialisationsArray = $newPrimarySkillsSpecialisationsArray;
						$newPrimarySkillsSpecialisationsArray = array();

						$k = 0;

						foreach ($primarySkillsSpecialisationsArray as $specialisation) {
							foreach ($skillsArray as $skill) {
								if($skill['isChildOf'] == $specialisation['id']){
									$temp = array('id' => $skill['id'],
													'skillsArrayIndex' => array_search($skill, $skillsArray),
													'alreadyHave' => FALSE);

									array_push($primarySkillsSpecialisationsArray, $temp);
								}
							}

							$k++;
						}
					} while (count($newPrimarySkillsSpecialisationsArray) > $k);
				}
			}


			/*
			* Selection de la langue
			*/

			// Si le personnage n est pas un animal...
			if($Character->race['id'] != 8 &&	// Race = non-chat
			$Character->race['id'] != 9){		// Race = non-cheval
				// Array des langues accesibles de base
				$langSkillsIdArray = array('11' => 'Langage altérien',
											'12' => 'Langage impérial',
											'13' => 'Langage nordique',
											'14' => 'Langage cortegan',
											'28' => 'Langage carénien',
											'41' => 'Langage irtanien',
											'42' => 'Langage dundorien',
											'50' => 'Langage elfique',
											'81' => 'Langage Yonnen');

				// Selection aleatoire de la nouvelle skill
				$randIndex = array_rand($langSkillsIdArray);

				// Attribution du premier point dans la nouvelle competence
				$skillArray = $_DB->getSkillById($randIndex);
				$skillArray['points'] = 1;
				$skillArray['isMain'] = 0;

				// Ajout de la nouvelle skill a la liste de skills courrante
				array_push($charSkillsArray, $skillArray);

				// Comptabilisation du point
				$i++;

				// Suppression de la skill dans la liste totale des skills pour eviter les doublons de competences
				unset($skillsArray[$randIndex]);
			}


			/*
			* Ajout des points de competences aleatoire
			*/

			// Attribution du premier rand "aleatoire"
			if($Character->orientation['id'] != 1){	// Classe = non-magicien
				$skillRand = rand(1, 100);
			}else{									// Classe = magicien
				$skillRand = $newSkillProb;
			}

			do {
				switch ($skillRand) {
					// Competence primaire
					case $skillRand <= $mainSkillProb:
						if($Character->orientation['id'] != 1){		// Si le personnage n est pas un magicien...
							if(count($primarySkillsSpecialisationsArray) > 0){
								$primSkillRand = rand(1, 100);

								if($primSkillRand <= 50){		// % de chances d augmenter la competence primaire de base
									// Incrementation de la skill primaire
									$charSkillsArray[0]['points']++;
								}else{
									$randIndex = array_rand($primarySkillsSpecialisationsArray);

									if($primarySkillsSpecialisationsArray[$randIndex]['alreadyHave'] == FALSE){ // Nouvelle specialisation
										// Attribution du premier point dans la nouvelle specialisation
										$skillArray = $_DB->getSkillById($primarySkillsSpecialisationsArray[$randIndex]['id']);
										$skillArray['points'] = 1;
										$skillArray['isMain'] = 0;

										// Ajout de la nouvelle skill a la liste de skills courrante
										array_push($charSkillsArray, $skillArray);

										// Pour eviter les doublons
										$primarySkillsSpecialisationsArray[$randIndex]['alreadyHave'] = TRUE;

										// Suppression de la skill dans la liste totale des skills pour eviter les doublons de competences
										unset($skillsArray[$primarySkillsSpecialisationsArray[$randIndex]['skillsArrayIndex']]);
									}else{	// Boost d une specialisation deja possedee par le personnage
										$t = 0;

										foreach ($charSkillsArray as $skill) {
											if($skill['id'] == $primarySkillsSpecialisationsArray[$randIndex]['id']){
												$charSkillsArray[$t]['points']++;
											}
										}
									}
								}
							}else{
								// Incrementation de la skill primaire
								$charSkillsArray[0]['points']++;
							}
						}

						// Point compte double
						$i++;

						break;
					// Nouvelle competence
					case $skillRand <= ($mainSkillProb + $newSkillProb):
						if(count($skillsArray) > 0){		// Si il existe encore des nouvelles competences a prendre...
							// Selection aleatoire de la nouvelle skill
							$randIndex = array_rand($skillsArray);

							// Attribution du premier point dans la nouvelle competence
							$skillArray = $_DB->getSkillById($skillsArray[$randIndex]['id']);
							$skillArray['points'] = 1;
							$skillArray['isMain'] = 0;

							// Ajout de la nouvelle skill a la liste de skills courrante
							array_push($charSkillsArray, $skillArray);

							// Suppression de la skill dans la liste totale des skills pour eviter les doublons de competences
							unset($skillsArray[$randIndex]);

							// Set de la competence comme acquise dans le cas ou elle serait une specialisation de la competence primaire
							if($Character->orientation['id'] != 1){
								$t = 0;

								foreach ($primarySkillsSpecialisationsArray as $skill) {
									if($skill['id'] == $skillArray['id']){
										$primarySkillsSpecialisationsArray[$t]['alreadyHave'] = TRUE;
									}
								}
							}

							break;
						}else{								// Sinon, ajout d un point dans une competence deja connue.
							// Selection aleatoire de la skill dans la liste de skill courante du personnage
							$randIndex = array_rand($charSkillsArray);

							// Incrementation de la skill
							$charSkillsArray[$randIndex]['points']++;

							break;
						}
					// Competence aleatoire dans la liste de competence actuelle
					default:
						// Selection aleatoire de la skill dans la liste de skill courante du personnage
						$randIndex = array_rand($charSkillsArray);

						// Incrementation de la skill
						$charSkillsArray[$randIndex]['points']++;

						break;
				}

				$i++;
				$skillRand = rand(1, 100);
			} while ($i <= $levelPoints);

			return $charSkillsArray;
		}

		// Renvoie une Array de sorts "aleatoire"
		public function setRandomSpells($_DB, $Character){
			// Recuperation de la liste des sorts accessible
			$spellsArray = $this->getAvailableSpells($_DB, $Character);

			// Formatage de l Array
			$formatedSpellsArray = array();
			$i = 0;

			foreach ($spellsArray as $spell) {
				if($i != $spell['typeId']){
					$i++;
					$formatedSpellsArray[$i][0] = $spell;
				}else{
					array_push($formatedSpellsArray[$i], $spell);
				}
			}

			// Definition des points de niveau
			$skillsLevelPoints = 0;

			foreach ($Character->skills as $skill) {
				$skillsLevelPoints = $skillsLevelPoints + $skill['points'];
			}

			$levelPointsMin = $Character->race['category'] * $Character->level;
			$levelPointsMax = $Character->race['category'] * ($Character->level + 1) - 1;

			$levelPoints = rand($levelPointsMin, $levelPointsMax);

			// Soustraction des points obtenu par les competences
			$levelPoints = $levelPoints - $skillsLevelPoints;

			$charSpellsArray = array();

			// Si il reste assez de points pour attribuer des sorts
			if($levelPoints >= 2){
				$i = 2;

				// Definition de l ID du type de magie du magicien
				$charMainTypeSpellsId = $this->defineMagicType($Character->class['id']);

				// Premier point de sort dans sa propre couleur de magie
				// Selection aleatoire du nouveau sort dans la magie de predilection du personnage
				$randIndex = array_rand($formatedSpellsArray[$charMainTypeSpellsId]);

				// Attribution du premier point de sort
				$spellArray = array('id' => $formatedSpellsArray[$charMainTypeSpellsId][$randIndex]['id'], 'points' => 1);

				// Ajout du nouveau sort dans la liste des sorts courrante
				array_push($charSpellsArray, $spellArray);

				// Point compte double
				$i = $i + 2;

				// Suppression du sort dans la liste totale des sorts pour eviter les doublons
				unset($formatedSpellsArray[$charMainTypeSpellsId][$randIndex]);

				// Distribution "aleatoire" des points de sorts restants
				// Definition des probabilites dans l attribution des points de sort (en %)
				$newMainTypeSpellProb = 30;	// Sort de magie primaire
				$newSpellProb = 15;			// Nouveau sort

				$rand = rand(1, 100);

				do {
					switch ($rand) {
						// Sort du type (couleur) primaire
						case $rand <= $newMainTypeSpellProb:
							// Selection aleatoire du nouveau sort dans la magie de predilection du personnage
							$randIndex = array_rand($formatedSpellsArray[$charMainTypeSpellsId]);

							// Attribution du premier point de sort
							$spellArray = array('id' => $formatedSpellsArray[$charMainTypeSpellsId][$randIndex]['id'], 'points' => 1);

							// Ajout du nouveau sort dans la liste des sorts courrante
							array_push($charSpellsArray, $spellArray);

							// Suppression du sort dans la liste totale des sorts pour eviter les doublons
							unset($formatedSpellsArray[$charMainTypeSpellsId][$randIndex]);

							break;
						// Nouveau sort
						case $rand <= ($newMainTypeSpellProb + $newSpellProb):
							// Selection aleatoire du type de sort
							$randSpellType = array_rand($formatedSpellsArray);

							// Selection aleatoire du nouveau sort
							$randIndex = array_rand($formatedSpellsArray[$randSpellType]);

							// Attribution du premier point de sort
							$spellArray = array('id' => $formatedSpellsArray[$randSpellType][$randIndex]['id'], 'points' => 1);

							// Ajout du nouveau sort dans la liste des sorts courrante
							array_push($charSpellsArray, $spellArray);

							// Suppression du sort dans la liste totale des sorts pour eviter les doublons
							unset($formatedSpellsArray[$randSpellType][$randIndex]);

							break;
						// Sort augmentation de points d un sort actuellement dans la liste choisit aleatoirement
						default:
							// Selection aleatoire du sort dans la liste de sort courante du personnage
							$randIndex = array_rand($charSpellsArray);

							// Incrementation de la skill
							$charSpellsArray[$randIndex]['points']++;

							break;
					}

					$i = $i + 2;
					$rand = rand(1, 100);
				} while ($i <= $levelPoints - 1);
			}

			return $charSpellsArray;
		}

		// Renvoie un facteur de vitesse defini "aleatoirement" en fonction d un perso  donne et de son niveau
		public function setRandomSpeedFactor($Character, $level){
			// Recuperation du facteur de vitesse de base de la race du personnage (pour eviter les cumul de refresh)
			$speedFactor = $Character->race['speedFactor'];

			$i = 1;

			// Pourcentage de chance reduire le facteur
			$pourcent = 7;

			do {
				if(rand(1, 100) <= $pourcent){
					$speedFactor--;
				}

				$i++;
			} while ($i <= $level);

			// Check pour que le factor ne puisse etre inferieur a 1
			if($speedFactor < 1){
				$speedFactor = 1;
			}

			return $speedFactor;
		}

		// Renvoie un nombre de point de vitalite defini "aleatoirement" en fonction d un personnage donne et de son niveau
		public function setRandomVitality($Character, $level){
			// Recuperation de la vitalite de base de la race du personnage (pour eviter les cumul de refresh)
			$vitality = $Character->race['vitality'];

			$i = 1;

			// Pourcentage de chance d obtenir un point suplementaire
			$pourcent = 40;

			do {
				if(rand(1, 100) <= $pourcent){
					$vitality++;
				}else{
					$i++;
				}
			} while ($i <= $level);

			return $vitality;
		}

		// Renvoie un facteur de volonte defini "aleatoirement" en fonction d un perso  donne et de son niveau
		public function setRandomWillFactor($Character, $level){
			// Recuperation du facteur de vitesse de base de la race du personnage (pour eviter les cumul de refresh)
			$willFactor = $Character->race['willFactor'];

			$i = 1;

			// Pourcentage de chance reduire le facteur
			$pourcent = 7;

			do {
				if(rand(1, 100) <= $pourcent){
					$willFactor--;
				}

				$i++;
			} while ($i <= $level);

			// Check pour que le factor ne puisse etre inferieur a 1
			if($willFactor < 1){
				$willFactor = 1;
			}

			return $willFactor;
		}

		// Renvoie l ID max de la table skills
		public function getSkillsMaxId($_DB){
			return $_DB->getSkillsMaxId();
		}

		// Renvoie l ID max de la table magic_spells
		public function getSpellsMaxId($_DB){
			return $_DB->getSpellsMaxId();
		}

		// Sauvegarde un personnage dans la DB
		public function saveCharacter($_DB, $Character){
			// Ajout du nouveau personnage dans la DB
			$_DB->insertCharacter($Character);

			// Recuperation du Character ID
			$characterId = $_DB->getCharactersMaxId();

			// Sauvegarde des data skills du personnage
			if(count($Character->skills) > 0){
				foreach ($Character->skills as $skill) {
					$_DB->insertCharacterSkill($characterId, $skill);
				}
			}

			// Atouts d orientation
			$orientationAsset = $_DB->getAssetByOrientationId($Character->orientation['id']);

			// Ajout de 2 points pour l atout d orientation et aucun pour le magiciens
			if($Character->orientation['id'] != 1){
				$_DB->insertCharacterAsset($characterId, $orientationAsset['id'], 2);
			}else{
				$_DB->insertCharacterAsset($characterId, $orientationAsset['id'], 0);
			}

			// Atout de classe
			$classAsset = $_DB->getAssetByClassId($Character->class['id']);

			$_DB->insertCharacterAsset($characterId, $classAsset['id'], 0);

			// Sauvegarde des datas d atouts de race et de niveau du personnage
			// Atouts de race
			if(count($Character->assets) > 0){
				foreach ($Character->assets as $asset) {
					// Formatage des donnees a transmettre a la DB
					$assetId = $asset['id'];
					$assetPoints = $asset['points'];

					$_DB->insertCharacterAsset($characterId, $assetId, $assetPoints);
				}
			}

			// Si le personnage est magicien...
			if($Character->orientation['id'] == 1){
				// Sauvegarde des data spells du personnage
				foreach ($Character->spells as $spell) {
					// Formatage des donnees a transmettre a la DB
					$spellId = $spell['id'];
					$spellPoints = $spell['points'];

					$_DB->insertCharacterSpell($characterId, $spellId, $spellPoints);
				}
			}
		}

		// Definit les attributs d un personnage donne de "aleatoirement"
		public function setRandomAttributes($Character, $level){
			// definition de l ecart de la moyenne en fonction du niveau du personnage
			$meanGap = 0.125 * ($level - 1);

			// Definition du taux de dispersion
			$disparity = 0.6 + (0.01 * ($level - 1));


			// FORCE
			$mean = ($Character->race['strengthMax'] / 2) + $meanGap;

			// Dispersion en fonction du genre
			if($Character->gender['id'] == '1'){	// Masculin
				$mean = $mean * 1.1;
			}else{									// Feminin
				$mean = $mean * 0.9;
			}

			$Character->strength = $Character->randGauss($mean, $disparity);


			// DEXTERITE
			$mean = ($Character->race['dexterityMax'] / 2) + $meanGap;

			$Character->dexterity = $Character->randGauss($mean, $disparity);


			// ENDURANCE
			$mean = ($Character->race['staminaMax'] / 2) + $meanGap;

			$Character->stamina = $Character->randGauss($mean, $disparity);


			// ESTHETISME
			$mean = ($Character->race['aestheticismMax'] / 2) + $meanGap;

			// Dispersion en fonction du genre
			if($Character->gender['id'] == '1'){	// Masculin
				$mean = $mean * 0.9;
			}else{									// Feminin
				$mean = $mean * 1.1;
			}

			$Character->aestheticism = $Character->randGauss($mean, $disparity);


			// CHARISME
			$mean = ($Character->race['charismaMax'] / 2) + $meanGap;

			$Character->charisma = $Character->randGauss($mean, $disparity);


			// EMPATHIE
			$mean = ($Character->race['empathyMax'] / 2) + $meanGap;

			$Character->empathy = $Character->randGauss($mean, $disparity);


			// INTELLIGENCE
			$mean = ($Character->race['intelligenceMax'] / 2) + $meanGap;

			$Character->intelligence = $Character->randGauss($mean, $disparity);


			// PERCEPTION
			$mean = ($Character->race['perceptionMax'] / 2) + $meanGap;

			$Character->perception = $Character->randGauss($mean, $disparity);


			// REFEXES
			$mean = ($Character->race['reflexesMax'] / 2) + $meanGap;

			$Character->reflexes = $Character->randGauss($mean, $disparity);

			return $Character;
		}
	}
?>
