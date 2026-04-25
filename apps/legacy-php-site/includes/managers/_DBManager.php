<?php
	class _DBManager{
		// Constructeur de la classe
		public function __construct(){
		}


		/*
		*	PRIVATES
		*/

		// Connecte le Manager a la DB
		private function connectDB(){
			//$mysqli = new mysqli('localhost', 'root', 'root', 'kw');
			//$mysqli = new mysqli('localhost', 'knightan_db', 'fcY7dEmqdJB8BzHZxH2CmwqqT', 'knightan_db');
			$mysqli = new mysqli('localhost', 'fkb001_kw', 'M7D74XWdyRvzy.UUELYTS', 'fkb001_kw');

			$mysqli->query("SET NAMES 'utf8'");

			return $mysqli;
		}

		// Ajoute une Array de competences primaire a une Array de class
		private function getPrimarySkillsByClassId($classId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills_merge_classes WHERE class_id = '$classId';";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = $this->getSkillById($row["skill_id"]);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Insert une array dans une array existant a une position donnee
		private function array_insert($array, $position, $insertArray){
		  $firstArray = array_splice ($array, 0, $position);

		  $array = array_merge($firstArray, $insertArray, $array);

		  return $array;
		}


		/*
		*	FORMAT
		*/

		// Format arena DB data
		private function formatArenaArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'description' => $row["description"],
							'arbitratorId' => $row["arbitrator_id"]);

			return $array;
		}

		// Format asset DB data
		private function formatAssetArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'effect' => $row["effect"],
							'activation' => $row["activation"],
							'unitId' => $row["unit_id"],
							'value' => $row["value"],
							'isOrientationAsset' => $row["is_orientation_asset"],
							'isClassAsset' => $row["is_class_asset"]);

			return $array;
		}

		// Format challenge DB data
		private function formatChallengeArray($row){
			$array = array('id' => $row["id"],
							'mjId' => $row["mj_id"],
							'place' => $this->getPlaceById($row["place_id"]),
							'typeId' => $row["type_id"],
							'name' => $row["name"],
							'nbrOfCharacters' => $row["nbr_of_characters"],
							'prize' => $row["prize"],
							'statusId' => $row["status_id"]);

			return $array;
		}

		// Format challenges_merge_characters DB data
		private function formatChallengeMergeCharacter($row){
			$array = array('id' => $row["id"],
							'challengeId' => $row["challenge_id"],
							'characterId' => $row["character_id"]);

			return $array;
		}

		// Format challenges_merge_skills DB data
		private function formatChallengeMergeSkill($row){
			$array = array('id' => $row["id"],
							'challengeId' => $row["challenge_id"],
							'attribute' => $row["attribute"],
							'skillId' => $row["skill_id"]);

			return $array;
		}

		// Format challenges_rounds DB data
		private function formatChallengeRound($row){
			$array = array('id' => $row["id"],
							'challengeId' => $row["challenge_id"],
							'round' => $row["round"],
							'characterId' => $row["character_id"],
							'text' => $row["text"],
							'resultId' => $row["result_id"]);

			return $array;
		}

		// Format Character DB data
		private function formatCharacterArray($row){
			$array = array('id' => $row["id"],
							'userId' => $row["user_id"],
							'genderId' => $row["gender_id"],
							'name' => $row["name"],
							'raceId' => $row["race_id"],
							'classId' => $row["class_id"],
							'orientationId' => $row["orientation_id"],
							'age' => $row["age"],
							'category' => $row["category"],
							'vitality' => $row["vitality"],
							'vitalityMax' => $row["vitality_max"],
							'speedFactor' => $row["speed_factor"],
							'willFactor' => $row["will_factor"],

							'energy' => $row["energy"],
							'energyMax' => $row["energy_max"],

							'strength' => $row["strength"],
							'dexterity' => $row["dexterity"],
							'stamina' => $row["stamina"],
							'aestheticism' => $row["aestheticism"],
							'reflexes' => $row["reflexes"],
							'perception' => $row["perception"],
							'charisma' => $row["charisma"],
							'intelligence' => $row["intelligence"],
							'empathy' => $row["empathy"],
							'placeId' => $row["place_id"],
							'statusId' => $row["status_id"],
							'note' => $row["note"]);

			return $array;
		}

		// Format Place DB data
		private function formatPlaceArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'isChildOf' => $row["is_child_of"],
							'statusId' => $row["status_id"],
							'isCapital' => $row["is_capital"]);

			return $array;
		}

		// Format Place Status DB data
		private function formatPlaceSatusArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"]);

			return $array;
		}

		// Format potion DB data
		private function formatPotionArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'effect' => $row["effect"],
							'ingredients' => $row["ingredients"],
							'recipe' => $row["recipe"],
							'difficulty' => $row["difficulty"],
							'value' => $row["value"]);

			return $array;
		}

		// Formate une string
		private function formatString($string){
			return addslashes($string);
		}

		// Formate un User
		private function formatUserArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'eMail' => $row["email"],
							'password' => $row["password"],
							'newCommentAlert' => $row["new_comment_alert"],
							'gameUpdateAlert' => $row["game_update_alert"]);

			return $array;
		}

		// Formate une Weapon
		private function formatWeaponsArray($row){
			$array = array('id' => $row["id"],
							'name' => $row["name"],
							'dammage' => $row["dammage"],
							'useStrength' => $row["use_strength"],
							'dammageType' => $row["dammage_type"],
							'difficulty' => $row["difficulty"],
							'weight' => $row["weight"],
							'special' => $row["special"]);

			return $array;
		}


		/*
		*	ORDER
		*/

		// Trie une array d assets
		private function orderAssetsArray($assetsArray){
			$i = 0;

			// Passage des atouts avec leur nom en index
			foreach ($assetsArray as $asset){
				if($asset['isOrientationAsset'] == TRUE){
					// Ajout de l atout d orientation a l Array avec l index A pour assurer la premiere place
					$assetsArray['A'] = $asset;
				}elseif($asset['isClassAsset'] == TRUE){
					$assetsArray['AA'] = $asset;
				}else{
					// Ajout des atouts a l Array mais avec le nom en index
					$assetsArray[$asset['name']] = $asset;
				}

				// Suppression de l asset ayant un numero comme index
				unset($assetsArray[$i]);

				$i++;
			}

			// Tri de l array en fonction de l index (soit du nom des atouts)
			ksort($assetsArray);

			$finalAssetsArray = array();

			// Passage de l array avec des index numerique
			foreach ($assetsArray as $asset) {
				array_push($finalAssetsArray, $asset);
			}

			return $finalAssetsArray;
		}

		// Trie une Array de competences par nom
		private function orderArrayByName($skillsArray){
			// Passage des competences avec leur nom en index
			$i = 0;

			foreach ($skillsArray as $skill){
				// Ajout des competences a l Array mais avec le nom de la competence en index
				$skillsArray[$skill['name']] = $skill;

				// Suppression de la competence ayant un numero comme index
				unset($skillsArray[$i]);

				$i++;
			}

			// Tri de l array en fonction de l index (soit du nom des competences)
			ksort($skillsArray);

			// Re-passage de l array avec des index numeriques
			$newSkillsArray = array();

			foreach ($skillsArray as $skill){
				array_push($newSkillsArray, $skill);
			}

			return $newSkillsArray;
		}

		// Cherche une competence mere dans une Array donne en fonction d un ID donne
		private function searchMotherSkillById($skillsArray, $motherSkillId){
			$motherFound = FALSE;

			foreach ($skillsArray as $skill) {
				if($skill['id'] == $motherSkillId){
					$motherFound = TRUE;
				}
			}

			return $motherFound;
		}

		// Verifie si une competence n a pas encore trouvee sa mere
		private function checkMotherlessSkill($skillsArray){
			$everySkillsHasItsMother = TRUE;

			foreach ($skillsArray as $skill) {
				if($skill['motherFound'] != TRUE){
					$everySkillsHasItsMother = FALSE;
				}
			}

			return $everySkillsHasItsMother;
		}

		// Trie une array de skills
		private function orderSkillsArray($skillsArray){
			// variables
			$i = 0;

			// Il faut trouver les meres de chaque competences.
			foreach ($skillsArray as $skill) {
				if($skill['isChildOf'] == 0){
					// Ajout d un flag (mere trouvee)
					$skillsArray[$i]['motherFound'] = TRUE;
				}else{
					$skillsArray[$i]['motherFound'] = FALSE;
				}

				$i++;
			}

			if ($this->checkMotherlessSkill($skillsArray) == FALSE) {
				do {
					// variables
					$i = 0;

					foreach ($skillsArray as $skill) {
						if($skill['motherFound'] != TRUE){
							$skillsArray[$i]['motherFound'] = $this->searchMotherSkillById($skillsArray, $skill['isChildOf']);

							// Si on ne trouve pas la mere dans l array presente alors on lui pctroie l id de sa grand mere en tant que mere
							if($skillsArray[$i]['motherFound'] == FALSE){
								$motherSkill = $this->getSkillById($skillsArray[$i]['isChildOf']);

								$skillsArray[$i]['isChildOf'] = $motherSkill['isChildOf'];

								if($skillsArray[$i]['isChildOf'] == 0){
									$skillsArray[$i]['motherFound'] = TRUE;
								}
							}
						}

						$i++;
					}
				} while ($this->checkMotherlessSkill($skillsArray) == FALSE);
			}

			// Tri de l Array par ordre alphabetique (du nom des competence)
			$skillsArray = $this->orderArrayByName($skillsArray);

			$oreredSkillsArray = array();

			$w = 0;

			// On retire toutes les competences sans mere (meres absolue) et on les range dans $oreredSkillsArray
			foreach ($skillsArray as $skill){
				// Si la competence est mere absolue (sans mere)
				if($skill['isChildOf'] == 0){
					// Ajout du niveau de la competence
					$skill['level'] = 0;

					// On ajoute celle-ci dans l Array finale
					array_push($oreredSkillsArray, $skill);

					// Suppression de la competence dans la liste des competence encore a traiter
					unset($skillsArray[$w]);
				}

				$w++;
			}

			$skillsArray = array_reverse($skillsArray);

			if(count($skillsArray) > 0){
				do {
					// Reset des index de l Array de competences restantes a triees
					$skillsArray = array_values($skillsArray);

					$u = 0;

					foreach ($skillsArray as $skill) {
						// Definition de la position qui sera attribuee a la specialisations dans l Array finale $oreredSkillsArray
						$position = 1;

						$oreredSkillsCopyArray = $oreredSkillsArray;

						foreach ($oreredSkillsCopyArray as $oreredSkillCopy) {
							if($skill['isChildOf'] == $oreredSkillCopy['id']){
								$skillsArray[$u]['motherFound'] = TRUE;

								// Ajout du niveau de la competence
								$skillsArray[$u]['level'] = $oreredSkillCopy['level'] + 1;

								// Formatage des data pour pouvoir etre utilises par la fonction array
								$tempArray = array();
								$tempArray['0'] = $skillsArray[$u];

								// Insert de la specialisation dans l array finale de competences
								$oreredSkillsArray = $this->array_insert($oreredSkillsArray, $position, $tempArray);

								// Suppression de la specilisation dans la listes des competence a encore traiter
								unset($skillsArray[$u]);
							}

							$position++;
						}

						$u++;
					}
				} while (count($skillsArray) > 0);
			}

			// Suppression du label mere trouvee
			$i = 0;

			foreach ($oreredSkillsArray as $oreredSkills) {
				unset($oreredSkillsArray[$i]['motherFound']);

				$i++;
			}

			return $oreredSkillsArray;
		}


		/*
		*	PUBLICS
		*/

		/*
		*	GET ALL
		*/

		// Renvoi toutes les actions dans une Array
		public function getAllActions(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM actions;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'attribute' => $row["attribute"],
								'skillId' => $row["skill_id"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les atouts dans une Array
		public function getAllAssets($order){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets ORDER BY $order ASC;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatAssetArray($row);

				// Formatage des donnees
				if($array['activation'] == 0){
					$array['activation'] = 'Permanent';
				}else{
					$array['activation'] = 'Ephémère';
				}

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les assets_merge_order dans une Array
		public function getAllAssetsMergeLevels(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_levels;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'assetId' => $row["asset_id"],
								'level' => $row["level"],
								'points' => $row["points"],
								'orientationId' => $row["orientation_id"],
								'classId' => $row["class_id"],
								'raceId' => $row["race_id"],
								'specialCondition' => $row["special_condition"]);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les personnage joueur dans une Array
		public function getAllCharacters(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters;";
			$result = $mysqli->query($sql);

			$CharactersPlayersArray = array();

			while($row = $result->fetch_assoc()) {
			    // Formatage des data
			    $array = $this->formatCharacterArray($row);

			    // Creation de l objet Character
			    $CharacterPlayer = new CharacterPlayer($this, $array);

			    array_push($CharactersPlayersArray, $CharacterPlayer);
			}

			return $CharactersPlayersArray;
		}

		// Renvoi toutes les classes dans une Array
		public function getAllClasses(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM classes ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'orientationId' => $row["orientation_id"],
								'primarySkillsArray' => $this->getPrimarySkillsByClassId($row["id"]));

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les atouts de classe
		public function getAllClassesAssets(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets WHERE is_class_asset = 1 ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'effect' => $row["effect"],
								'activation' => $row["activation"],
								'unitId' => $row["unit_id"],
								'value' => $row["value"],
								'isOrientationAsset' => $row["is_orientation_asset"],
								'isClassAsset' => $row["is_class_asset"]);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toute les donnees de la tables "genders" dans une Array
		public function getAllGenders(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM genders ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi la table characters_common
		public function getAllNpc(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters_npc;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'raceId' => $row["race_id"],
								'classId' => $row["class_id"],
								'mainSkillId' => $row["main_skill_id"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toute les donnees de la tables "orientations" dans une Array
		public function getAllOrientations(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM orientations ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {

				$array = array('id' => $row["id"],
								'name' => $row["name"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les personnage joueur dans une Array
		public function getAllPlaces(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPlaceArray($row);

				// Creation de l objet Character
			    $Place = new Place($this, $array);

			    array_push($resultArray, $Place);
			}

			return $resultArray;
		}

		// Renvoi tous les status de lieux dans une Array
		public function getAllPlacesStatus(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places_status ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPlaceSatusArray($row);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toutes les donnees de la table "potions" dans une Array
		public function getAllPotions($order){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			if($order == 'name'){
				$sql = "SELECT * FROM potions ORDER BY $order ASC;";
			} else {
				$sql = "SELECT * FROM potions ORDER BY $order ASC, name ASC;";
			}

			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPotionArray($row);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toutes les donnees de la tables "races" dans une Array
		public function getAllRaces($order){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM races ORDER BY $order;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {

				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'category' => $row["category"],
								'vitality' => $row["vitality"],
								'speedFactor' => $row["speed_factor"],
								'willFactor' => $row["will_factor"],
								'strengthMax' => $row["strength_max"],
								'dexterityMax' => $row["dexterity_max"],
								'staminaMax' => $row["stamina_max"],
								'aestheticismMax' => $row["aestheticism_max"],
								'reflexesMax' => $row["reflexes_max"],
								'perceptionMax' => $row["perception_max"],
								'charismaMax' => $row["charisma_max"],
								'intelligenceMax' => $row["intelligence_max"],
								'empathyMax' => $row["empathy_max"]);

				// Ajout des atouts de races
				$array['assets'] = $this->getAssetsByRaceId($array['id']);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toutes les competences dans une Array
		public function getAllSkills(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'familyId' => $row["family_id"],
								'isChildOf' => $row["is_child_of"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toutes des donnees de la tables "skills_families" dans une Array
		public function getAllSkillsFamilies(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills_families ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {

				$array = array('id' => $row["id"],
								'name' => $row["name"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les sorts contenu dans une array
		public function getAllSpells($order){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			if($order == 'name'){
				$sql = "SELECT * FROM magic_spells ORDER BY $order ASC;";
			} else {
				$sql = "SELECT * FROM magic_spells ORDER BY $order ASC, name ASC;";
			}

			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'effect' => $row["effect"],
								'typeId' => $row["type_id"],
								'energy' => $row["energy"],
								'castingTime' => $row["casting_time"],
								'difficulty' => $row["difficulty"],
								'value' => $row["value"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tous les status dans une array
		public function getAllStatus(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM status ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoie tous les Users dans une array
		public function getAllUsers(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM users;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			// Creation de l objet User
			while($row = $result->fetch_assoc()) {
				// Formatage des data
			    $array = $this->formatUserArray($row);

				// Creation de l objet User
				$User = new User($this, $array);

				array_push($resultArray, $User);
			}

			return $resultArray;
		}

		// Renvoie tous les Users dans une array
		public function getAllWeapons($order){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			if($order == 'name'){
				$sql = "SELECT * FROM weapons ORDER BY $order ASC;";
			} else {
				$sql = "SELECT * FROM weapons ORDER BY $order ASC, name ASC;";
			}

			$result = $mysqli->query($sql);

			$resultArray = array();

			// Creation des objets Weapon
			while($row = $result->fetch_assoc()) {

				// Formatage des data
				$array = $this->formatWeaponsArray($row);

				// Creation de l objet User
				$Weapon = new Weapon($this, $array);

				array_push($resultArray, $Weapon);

			}

			return $resultArray;
		}


		/*
		*	GET BY
		*/

		// Renvoie une ligne de la table "actions"
		public function getActionById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();


			// Requete
			$sql = "SELECT * FROM actions WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'name' => $row["name"],
									'attribute' => $row["attribute"],
									'skillId' => $row["skill_id"]);
			}

			return $resultArray;
		}

		// Renvoie un objet de type Arena en fonction d un ID donne
		public function getArenaById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();


			// Requete
			$sql = "SELECT * FROM arenas WHERE id = '$id';";
			$result = $mysqli->query($sql);

			// Formatage des data
			while($row = $result->fetch_assoc()) {
				$array = $this->formatArenaArray($row);
		    }

			// Creation de l objet Character
			$Arena = new Arena($this, $array);

			return $Arena;
		}

		// Renvoie une array contenant un atout en fonction de l ID donne d une classe
		public function getAssetByClassId($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_classes WHERE class_id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'assetId' => $row["asset_id"],
									'classId' => $row["class_id"]);
			}

			// Recuperation de l atout
			$asset = $this->getAssetById($resultArray['assetId']);

			return $asset;
		}

		// Renvoie une array contenant un atout en fonction d un ID donne
		public function getAssetById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = $this->formatAssetArray($row);
			}

			return $resultArray;
		}

		// Renvoie une array contenant un atout en fonction de l ID donne d une orientation
		public function getAssetByOrientationId($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_orientations WHERE orientation_id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'assetId' => $row["asset_id"],
									'orientationId' => $row["orientation_id"],
									'points' => $row["points"]);
			}

			// Recuperation de l atout
			$asset = $this->getAssetById($resultArray['assetId']);

			return $asset;
		}

		// Renvoie une array contenant un atout en fonction d un ID donne
		public function getAssetsByRaceId($raceId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_races WHERE race_id = '$raceId';";
			$result = $mysqli->query($sql);

			$raceAssetsArray = array();

			while($row = $result->fetch_assoc()){
				$assetArray = $this->getAssetById($row["asset_id"]);

				$assetArray['points'] = $row["points"];

				array_push($raceAssetsArray, $assetArray);
			}

			return $raceAssetsArray;
		}

		// Renvoi une Array contenant une ligne de la table assets_merge_levels en fonction de l ID d un atout
		public function getAssetsMergeLevelsByAssetId($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_levels WHERE asset_id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'assetId' => $row["asset_id"],
								'level' => $row["level"],
								'points' => $row["points"],
								'orientationId' => $row["orientation_id"],
								'classId' => $row["class_id"],
								'raceId' => $row["race_id"],
								'specialCondition' => $row["special_condition"]);
			}

			return $array;
		}

		// Renvoi une Array contenant une ligne de la table assets_merge_levels en fonction d un ID donne
		public function getAssetMergeLevelById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_levels WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'assetId' => $row["asset_id"],
								'level' => $row["level"],
								'points' => $row["points"],
								'orientationId' => $row["orientation_id"],
								'classId' => $row["class_id"],
								'raceId' => $row["race_id"],
								'specialCondition' => $row["special_condition"]);
			}

			return $array;
		}

		// Renoi une Array contant une ligne de la table challenges
		public function getChallengeById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM challenges WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatChallengeArray($row);
			}

			// Recuperation des competences et attribut lies au challenge
			$challengeSkillArray = $this->getChallengeMergeSkillsByChallengeId($id);

			// Definition de l attribut lie au challenge
			$array['attribute'] = $challengeSkillArray[0]['attribute'];

			unset($challengeSkillArray[0]);

			$array['skills'] = array();

			foreach ($challengeSkillArray as $challengeMergeskill) {
				$skill = $this->getSkillById($challengeMergeskill['skillId']);

				array_push($array['skills'], $skill);
			}

			return $array;
		}

		// Renvoi toutes les infos de la table challenges_merge_characters en fonction d un ID de challenge donne
		public function getChallengesMergeCharactersByChallengeId($challengeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM challenges_merge_characters WHERE challenge_id = '$challengeId';";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()){
				// Formatage des data
				$array = $this->formatChallengeMergeCharacter($row);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi toutes les ligne de la table challenges_merge_skills en fonction de l ID d un challenge donne
		public function getChallengeMergeSkillsByChallengeId($challengeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM challenges_merge_skills WHERE challenge_id = '$challengeId';";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()){
				// Formatage des data
				$array = $this->formatChallengeMergeSkill($row);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi tout les rounds d un chalenge en fonction de l ID de celui-ci
		public function getChallengesRoundsByChallengeId($challengeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM challenges_rounds WHERE challenge_id = '$challengeId';";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()){
				// Formatage des data
				$array = $this->formatChallengeRound($row);

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi un objet Character en fonction d un ID donne
		public function getCharacterById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = $this->formatCharacterArray($row);
		    }

			// Creation de l objet Character
			$CharacterPlayer = new CharacterPlayer($this, $array);

			// Ajout des competences
			$CharacterPlayer->skills = $this->getCharacterSkillsByCharacterId($CharacterPlayer->id);

			// Ajout des atouts
			// Requete
			$sql = "SELECT * FROM assets_merge_characters WHERE character_id = '$CharacterPlayer->id';";
			$result = $mysqli->query($sql);

			$assetsArray = array();

			while($row = $result->fetch_assoc()) {
				$formatedAssetsArray = array();

				$array = array('id' => $row["id"],
								'assetId' => $row["asset_id"],
								'characterId' => $row["character_id"],
								'points' => $row["points"]);

				// Formatage
				$assetId = $array['assetId'];

				// Requete
				$sql = "SELECT * FROM assets WHERE id = '$assetId';";
				$result2 = $mysqli->query($sql);

				while($row2 = $result2->fetch_assoc()) {
					$array2 = array('id' => $row2["id"],
									'name' => $row2["name"],
									'effect' => $row2["effect"],
									'activation' => $row2["activation"],
									'unitId' => $row2["unit_id"],
									'value' => $row2["value"],
									'isOrientationAsset' => $row2["is_orientation_asset"],
									'isClassAsset' => $row2['is_class_asset'],
									'points' => $array['points']);
				}

				array_push($assetsArray, $array2);
			}

			// Tri de l array de competences
			$assetsArray = $this->orderAssetsArray($assetsArray);

			$CharacterPlayer->assets = $assetsArray;

			// Ajout des sorts
			// Requete
			$sql = "SELECT * FROM characters_merge_spells WHERE character_id = '$CharacterPlayer->id';";
			$result = $mysqli->query($sql);

			$spellsArray = array();

			while($row = $result->fetch_assoc()) {
				$formatedSpellsArray = array();

				$array = array('id' => $row["id"],
								'characterId' => $row["character_id"],
								'spellId' => $row["spell_id"],
								'points' => $row["points"]);

				// Formatage
				$spellId = $array['spellId'];

				// Requete
				$sql = "SELECT * FROM magic_spells WHERE id = '$spellId';";
				$result2 = $mysqli->query($sql);

				while($row2 = $result2->fetch_assoc()) {
					$array2 = array('id' => $row2["id"],
									'name' => $row2["name"],
									'effect' => $row2["effect"],
									'typeId' => $row2["type_id"],
									'energy' => $row2["energy"],
									'castingTime' => $row2["casting_time"],
									'difficulty' => $row2["difficulty"],
									'points' => $array['points']);
				}

				array_push($spellsArray, $array2);
			}

			// Tri des sorts
			$spellsArray = $this->orderArrayByName($spellsArray);

			// Attribution des sorts au personnage
			$CharacterPlayer->spells = $spellsArray;

			// Definition du niveau du personnage
			$CharacterPlayer->getMyLevel();

			return $CharacterPlayer;
		}

		// Renvoi un objet Character en fonction d un ID donne
		public function getCharacterByIdAndUserId($characterId, $userId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters WHERE id = '$characterId' AND user_id = '$userId';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = $this->formatCharacterArray($row);
		    }

			// Creation de l objet Character
			$CharacterPlayer = new CharacterPlayer($this, $array);

			return $CharacterPlayer;
		}

		// Renvoi un objet Character en fonction d un ID donne
		public function getCharactersByPlaceId($placeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters WHERE place_id = '$placeId';";
			$result = $mysqli->query($sql);

			$CharactersPlayersArray = array();

			while($row = $result->fetch_assoc()) {
			    // Formatage des data
			    $array = $this->formatCharacterArray($row);

			    // Creation de l objet Character
			    $CharacterPlayer = new CharacterPlayer($this, $array);

			    array_push($CharactersPlayersArray, $CharacterPlayer);
			}

			return $CharactersPlayersArray;
		}

		// Renvoi une Array contenant des CHaracter en fonction d un status donne
		public function getCharactersByStatusId($statusId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters WHERE status_id = '$statusId';";
			$result = $mysqli->query($sql);

			$CharactersPlayersArray = array();

			while($row = $result->fetch_assoc()) {
			    // Formatage des data
			    $array = $this->formatCharacterArray($row);

			    // Creation de l objet Character
			    $CharacterPlayer = new CharacterPlayer($this, $array);

			    array_push($CharactersPlayersArray, $CharacterPlayer);
			}

			return $CharactersPlayersArray;
		}

		// Renvoi une Array avec tous les personnage joueur d un user en fonction de son ID
		public function getCharactersArrayByUserId($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters WHERE user_id = '$id' ORDER BY name;";
			$result = $mysqli->query($sql);

			$CharactersPlayersArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatCharacterArray($row);

				// Creation de l objet Character
				$CharacterPlayer = new CharacterPlayer($this, $array);

			    array_push($CharactersPlayersArray, $CharacterPlayer);
			}

			return $CharactersPlayersArray;
		}

		// Renvoi une Array avec toutes les infos d une competences pour un personnage donne en fonction des ID
		public function getCharacterSkillById($characterId, $skillId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Recuperation de la competence
			$skillArray = $this->getSkillById($skillId);

			// Recuperation les infos inter personnage/competence
			// Requete
			$sql = "SELECT * FROM characters_merge_skills WHERE character_id = '$characterId' AND skill_id = '$skillId';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'characterId' => $row["character_id"],
								'skillId' => $row["skill_id"],
								'points' => $row["points"],
								'isMain' => $row["is_main"]);
			}

			$skillArray['points'] = $array['points'];
			$skillArray['isMain'] = $array['isMain'];

			return $skillArray;
		}

		// Renvoi une Array avec toutes les competences d un personnage en fonction de l ID du personnage
		public function getCharacterSkillsByCharacterId($characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM characters_merge_skills WHERE character_id = '$characterId';";
			$result = $mysqli->query($sql);

			$skillsArray = array();

			while($row = $result->fetch_assoc()) {
				$formatedSkillsArray = array();

				$array = array('id' => $row["id"],
								'characterId' => $row["character_id"],
								'skillId' => $row["skill_id"],
								'points' => $row["points"],
								'isMain' => $row["is_main"]);

				// Formatage
				$skillId = $array['skillId'];

				// Requete
				$sql = "SELECT * FROM skills WHERE id = '$skillId';";
				$result2 = $mysqli->query($sql);

				while($row2 = $result2->fetch_assoc()) {
					$array2 = array('id' => $row2["id"],
									'name' => $row2["name"],
									'familyId' => $row2["family_id"],
									'isChildOf' => $row2["is_child_of"],
									'points' => $array['points'],
									'isMain' => $row["is_main"]);
				}

				array_push($skillsArray, $array2);
			}

			// Tri de l array de competences
			$skillsArray = $this->orderSkillsArray($skillsArray);

			return $skillsArray;
		}

		// Renvoi une Array avec toutes les infos d un sort pour un personnage donne en fonction des ID
		public function getCharacterSpellById($characterId, $spellId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Recuperation de la competence
			$spellArray = $this->getSpellById($spellId);

			// Recuperation les infos inter personnage/sort
			// Requete
			$sql = "SELECT * FROM characters_merge_spells WHERE character_id = '$characterId' AND spell_id = '$spellId';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'characterId' => $row["character_id"],
								'spellId' => $row["spell_id"],
								'points' => $row["points"]);
			}

			$spellArray['points'] = $array['points'];

			return $spellArray;
		}

		// Renvoie une ligne de la table "classes"
		public function getClassById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM classes WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'name' => $row["name"],
									'orientationId' => $row["orientation_id"],
									'primarySkillsArray' => $this->getPrimarySkillsByClassId($row["id"]));
			}

			return $resultArray;
		}

		// Renvoi toutes les classes en liees a une orientation (ID donne)
		public function getClassesByOrientationId($orientationId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM classes WHERE orientation_id = '$orientationId' ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
									'name' => $row["name"],
									'orientationId' => $row["orientation_id"],
									'primarySkillsArray' => $this->getPrimarySkillsByClassId($row["id"]));

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi une Array contenant touts les commentaire pour un lieu defini par son ID
		public function getCommentsArrayByForumPlaceId($forumPlaceId, $page){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Definition du nombre de post par page
			$limit = NUM_POST_P_PAGE;

			// Definition des post a ignorer (selon la page courrante)
			$offset = ($page - 1) * NUM_POST_P_PAGE;

			// Requete
			$sql = "SELECT * FROM forum_comments WHERE forum_place_id = '$forumPlaceId' ORDER BY id DESC LIMIT $offset, $limit;";
			$result = $mysqli->query($sql);

			$commentsArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'forumPlaceId' => $row["forum_place_id"],
								'characterId' => $row["character_id"],
								'text' => $row["text"],
								'date' => $row["date"]);

				array_push($commentsArray, $array);
			}

			return $commentsArray;
		}

		// Renvoi une array avec toutes les infos d un comment en fonction d un ID donne
		public function getCommentById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM forum_comments WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'forumPlaceId' => $row["forum_place_id"],
									'characterId' => $row["character_id"],
									'text' => $row["text"],
									'date' => $row["date"]);
			}

			return $resultArray;
		}

		// Renvoie un genre en fonction d un ID donne
		public function getGenderById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM genders WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
								'name' => $row["name"]);
			}

			return $resultArray;
		}

		// Renvoie une ligne de la table "orientations" en fonction d un ID donne
		public function getOrientationById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM orientations WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
								'name' => $row["name"]);
			}

			return $resultArray;
		}

		// Renvoie une place en fonction d un ID donne
		public function getPlaceById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPlaceArray($row);

				// Creation de l objet Character
			    $Place = new Place($this, $array);
			}

			return $Place;
		}

		// Renvoi une array contenant la liste des Place "fille de ..." en fonction d un ID donne
		public function getPlacesByMotherId($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places WHERE is_child_of = '$id' ORDER BY name;";
			$result = $mysqli->query($sql);

			$PlacesArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPlaceArray($row);

				// Creation de l objet Character
			    $Place = new Place($this, $array);

			    array_push($PlacesArray, $Place);
			}

			return $PlacesArray;
		}

		// Renvoie une place en fonction d un ID donne
		public function getPlacesByStatusId($statusId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places WHERE status_id = '$statusId' ORDER BY name;";
			$result = $mysqli->query($sql);

			$PlacesArray = array();

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$array = $this->formatPlaceArray($row);

			    array_push($PlacesArray, $array);
			}

			return $PlacesArray;
		}

		// Renvoie un status de lieu en fonction d un ID donne
		public function getPlaceStatusById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM places_status WHERE id = '$id' ORDER BY name;";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				// Formatage des data
				$resultArray = $this->formatPlaceSatusArray($row);
			}

			return $resultArray;
		}

		// Renvois tous les atouts dans une Array
		public function getRacesAssets(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets WHERE is_orientation_asset = 0 AND is_class_asset = 0 ORDER BY name ASC;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()){
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'effect' => $row["effect"],
								'activation' => $row["activation"],
								'unitId' => $row["unit_id"],
								'value' => $row["value"],
								'isOrientationAsset' => $row["is_orientation_asset"],
								'isClassAsset' => $row["is_class_asset"]);

				// Formatage des donnees
				if($array['activation'] == 0){
					$array['activation'] = 'Permanent';
				}else{
					$array['activation'] = 'Ephémère';
				}

				array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoie une ligne de la table "races" en fonction d un ID donne
		public function getRaceById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM races WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
								'name' => $row["name"],
								'vitality' => $row["vitality"],
								'category' => $row["category"],
								'speedFactor' => $row["speed_factor"],
								'willFactor' => $row["will_factor"],
								'strengthMax' => $row["strength_max"],
								'dexterityMax' => $row["dexterity_max"],
								'staminaMax' => $row["stamina_max"],
								'aestheticismMax' => $row["aestheticism_max"],
								'reflexesMax' => $row["reflexes_max"],
								'perceptionMax' => $row["perception_max"],
								'charismaMax' => $row["charisma_max"],
								'intelligenceMax' => $row["intelligence_max"],
								'empathyMax' => $row["empathy_max"]);

				// Ajout des atouts de races
				$resultArray['assets'] = $this->getAssetsByRaceId($id);
			}

			return $resultArray;
		}

		// Renvoi toutes les donnees d une "skill" dans une Array en fonction d un ID donne
		public function getSkillById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
										'name' => $row["name"],
										'familyId' => $row["family_id"],
										'isChildOf' => $row["is_child_of"]);
			}

			return $resultArray;
		}

		// Renvoi toutes les donnees de la tables "skills" dans une Array
		public function getSkillsBySkillsFamilyId($familySkillsId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills WHERE family_id = '$familySkillsId';";
			$result = $mysqli->query($sql);

			$skillsArray = array();

			while($row = $result->fetch_assoc()){
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'familyId' => $row["family_id"],
								'isChildOf' => $row["is_child_of"]);

				array_push($skillsArray, $array);
			}

			$skillsArray = $this->orderSkillsArray($skillsArray);

			return $skillsArray;
		}

		// Renvoi toutes les donnees d un "spell" dans une Array en fonction d un ID donne
		public function getSpellById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM magic_spells WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {

				$resultArray = array('id' => $row["id"],
									'name' => $row["name"],
									'effect' => $row["effect"],
									'typeId' => $row["type_id"],
									'energy' => $row["energy"],
									'castingTime' => $row["casting_time"],
									'difficulty' => $row["difficulty"],
									'value' => $row["value"]);
			}

			return $resultArray;
		}

		// Renvoie une place en fonction d un ID donne
		public function getStatusById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM status WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
								'name' => $row["name"]);
			}

			return $resultArray;
		}

		// Renvoie la competence mere d une specialisation (competence) en fonction de son ID
		public function getMainSkillById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
								'name' => $row["name"]);
			}

			return $resultArray;
		}

		// Renvoie une Array contenant toutes les competences primaires (sans mere)
		public function getPrimarySkills(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM skills WHERE is_child_of = 0 ORDER BY name;";
			$result = $mysqli->query($sql);

			$resultArray = array();

			while($row = $result->fetch_assoc()) {
				$array = array('id' => $row["id"],
								'name' => $row["name"],
								'familyId' => $row["family_id"],
								'isChildOf' => $row["is_child_of"]);

			    array_push($resultArray, $array);
			}

			return $resultArray;
		}

		// Renvoi un User en fonction d un email et password donne
		public function getUserByEMailAndPassword($email, $password){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM users WHERE email = '$email' AND password ='$password';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				// Formatage des data
			    $array = $this->formatUserArray($row);

				// Creation de l objet User
				$User = new User($this, $array);
			}

			return $User;
		}

		// Recupere un User en fonction d un ID donne
		public function getUserById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM users WHERE id = '$id';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				// Formatage des data
			    $array = $this->formatUserArray($row);

				// Creation de l objet User
				$User = new User($this, $array);
			}

			return $User;
		}


		/*
		*	GET MAX / MIN
		*/

		// Renvoi l ID max de la table assets
		public function getAssetsMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM assets;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}

		// Renvoi l ID max de la table characters
		public function getChallengesMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM challenges;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}

		// Renvoi l ID max de la table characters
		public function getCharactersMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM characters;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}

		// Renvoi l ID max de la table race
		public function getRacesMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM races;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}

		// Renvoi l ID max de la table skills
		public function getSkillsMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM skills;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}

		// Renvoi l ID max de la table magic_spells
		public function getSpellsMaxId(){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT MAX(id) FROM magic_spells;";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$maxId = $row['MAX(id)'];

			return $maxId;
		}


		/*
		*	COUNT
		*/

		// Renvoi le nombre de commentaire total dans une place en fonction de son ID
		public function countTotalCommentByForumPlaceId($placeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT COUNT(*) FROM forum_comments WHERE forum_place_id = '$placeId';";
			$result = $mysqli->query($sql);

			$row = $result->fetch_assoc();

			$total = $row['COUNT(*)'];

			return $total;
		}


		/*
		*	INSERT
		*/

		// Insert un arena maerge character
		public function insertArenaMergeCharacter($arenaId, $characterId, $arenaStatusId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO arenas_merge_characters (id,
														arena_id,
														character_id,
														arena_status_id)

												VALUES ('',
														'$arenaId',
														'$characterId',
														'$arenaStatusId');";

			$result = $mysqli->query($sql);
		}

		// Insert un challenge dans la DB
		public function insertChallenge($mjId, $placeId, $typeId, $name, $nbrOfCharacters, $prize, $statusId, $attribute, $skillId, $specialisationsArray){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage des donnees a transmettre a la DB
			$name = $this->formatString($name);

			// Requete
			$sql = "INSERT INTO challenges (id,
											mj_id,
											place_id,
											type_id,
											name,
											nbr_of_characters,
											prize,
											status_id)

									VALUES ('',
											'$mjId',
											'$placeId',
											'$typeId',
											'$name',
											'$nbrOfCharacters',
											'$prize',
											'$statusId');";

			$result = $mysqli->query($sql);
		}

		// Insert de la table challenges_merge_characters dans la DB
		public function insertChallengesMergeCharacters($challengeId, $characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO challenges_merge_characters (id,
															challenge_id,
															character_id)

													VALUES ('',
															'$challengeId',
															'$characterId');";

			$result = $mysqli->query($sql);
		}

		// Insert de la table challenges_merge_skills dans la DB
		public function insertChallengesMergeSkills($challengeId, $attribute, $skillId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO challenges_merge_skills (id,
														challenge_id,
														attribute,
														skill_id)

												VALUES ('',
														'$challengeId',
														'$attribute',
														'$skillId');";

			$result = $mysqli->query($sql);
		}

		// Insert de la table challenges_rounds_difficulties dans la DB
		public function insertChallengeRoundDifficulty($challengeId, $round, $difficulty){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO challenges_rounds_difficulties (id,
																challenge_id,
																round,
																difficulty)

														VALUES ('',
																'$challengeId',
																'$round',
																'$difficulty');";

			$result = $mysqli->query($sql);
		}

		// Insert un personnage joueur dans la DB
		public function insertCharacter($Character){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage des donnees a transmettre a la DB
			if(isset($Character->gender)){
				$genderId = $Character->gender['id'];
			}else{
				$genderId = 0;
			}

			if(isset($Character->race)){
				$raceId = $Character->race['id'];
			}else{
				$raceId = 0;
			}

			if(isset($Character->gender)){
				$orientationId = $Character->orientation['id'];
			}else{
				$orientationId = 0;
			}

			if(isset($Character->gender)){
				$classId = $Character->class['id'];
			}else{
				$classId = 0;
			}

			// Requete
			$sql = "INSERT INTO characters (id,
											user_id,
											gender_id,
											name,
											race_id,
											orientation_id,
											class_id,
											age,
											category,
											vitality,
											vitality_max,
											speed_factor,
											will_factor,
											strength,
											dexterity,
											stamina,
											aestheticism,
											reflexes,
											perception,
											charisma,
											intelligence,
											empathy,
											place_id,
											status_id)

									VALUES ('',
											'$Character->userId',
											'$genderId',
											'$Character->name',
											'$raceId',
											'$orientationId',
											'$classId',
											'$Character->age',
											'$Character->category',
											'$Character->vitality',
											'$Character->vitalityMax',
											'$Character->speedFactor',
											'$Character->willFactor',
											'$Character->strength',
											'$Character->dexterity',
											'$Character->stamina',
											'$Character->aestheticism',
											'$Character->reflexes',
											'$Character->perception',
											'$Character->charisma',
											'$Character->intelligence',
											'$Character->empathy',
											'0',
											'3');";

			$result = $mysqli->query($sql);
		}

		// Insert d un nouvel atout a un personnage en fonction d ID donnes
		public function insertCharacterAsset($characterId, $assetId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO assets_merge_characters (id,
														asset_id,
														character_id,
														points)

												VALUES ('',
														'$assetId',
														'$characterId',
														'$points');";

			$result = $mysqli->query($sql);
		}

		// Insert d une nouvelle competence a un personnage en fonction d ID donnes
		public function insertCharacterSkill($characterId, $skill){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage des donnees
			$skillId = $skill['id'];
			$skillPoints = $skill['points'];
			$skillIsMain = $skill['isMain'];

			// Requete
			$sql = "INSERT INTO characters_merge_skills (id,
														character_id,
														skill_id,
														points,
														is_main)

												VALUES ('',
														'$characterId',
														'$skillId',
														'$skillPoints',
														'$skillIsMain');";

			$result = $mysqli->query($sql);
		}

		// Insert un nouvel atout dans la DB
		public function insertAsset($name, $effect, $activation, $unitId, $value, $isOrientationAsset, $isClassAsset){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$effect = $this->formatString($effect);

			if($isOrientationAsset == TRUE){
				$isOrientationAsset = 1;
			}else{
				$isOrientationAsset = 0;
			}

			if($isClassAsset == TRUE){
				$isClassAsset = 1;
			}else{
				$isClassAsset = 0;
			}

			// Requete
			$sql = "INSERT INTO assets (id,
										name,
										effect,
										activation,
										unit_id,
										value,
										is_orientation_asset,
										is_class_asset)

								VALUES ('',
										'$name',
										'$effect',
										'$activation',
										'$unitId',
										'$value',
										'$isOrientationAsset',
										'$isClassAsset');";

			$result = $mysqli->query($sql);
		}

		// Insert une ligne dans la table assets_merge_classes
		public function insertAssetMergeClass($assetId, $classId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO assets_merge_classes (id,
														asset_id,
														class_id)

												VALUES ('',
														'$assetId',
														'$classId');";

			$result = $mysqli->query($sql);
		}

		// Insert une ligne dans la table assets_merge_levels
		public function insertAssetsMergeLevels($assetId, $level, $points, $orientationId, $classId, $raceId, $specialCondition){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage
			$specialCondition = $this->formatString($specialCondition);

			if($orientationId == ''){
				$orientationId = 0;
			}

			if($classId == ''){
				$classId = 0;
			}

			if($raceId == ''){
				$raceId = 0;
			}

			// Requete
			$sql = "INSERT INTO assets_merge_levels (id,
														asset_id,
														level,
														points,
														orientation_id,
														class_id,
														race_id,
														special_condition)

												VALUES ('',
														'$assetId',
														'$level',
														'$points',
														'$orientationId',
														'$classId',
														'$raceId',
														'$specialCondition');";

			$result = $mysqli->query($sql);
		}

		// Insert une ligne dans la table assets_merge_orientations
		public function insertAssetMergeOrientation($assetId, $orientationId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO assets_merge_orientations (id,
															asset_id,
															orientation_id,
															points)

													VALUES ('',
															'$assetId',
															'$orientationId',
															'$points');";

			$result = $mysqli->query($sql);
		}

		// Insert des nouvelles competences a un personnage en fonction d ID donnes
		public function insertCharacterSpell($characterId, $spellId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO characters_merge_spells (id,
														character_id,
														spell_id,
														points)

												VALUES ('',
														'$characterId',
														'$spellId',
														'$points');";

			$result = $mysqli->query($sql);
		}

		// Insert une nouvelle skill dans la DB
		public function insertClass($name, $orientationId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "INSERT INTO classes (id, name, orientation_id) VALUES ('', '$name', '$orientationId');";
			$result = $mysqli->query($sql);
		}

		// Insert un nouveau lieu dans la DB
		public function insertPlace($name, $isChildOf, $statusId, $isCapital){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "INSERT INTO places (id, name, is_child_of, status_id, is_capital) VALUES ('', '$name', '$isChildOf', '$statusId', '$isCapital');";
			$result = $mysqli->query($sql);
		}

		// Insert une nouvelle race dans la DB
		public function insertRace($name, $category, $vitality, $speedFactor, $willFactor, $strengthMax, $dexterityMax,
									$staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax, $perceptionMax,
									$reflexesMax, $assetsArray){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "INSERT INTO races (id,
										name,
										category,
										vitality,
										speed_factor,
										will_factor,
										strength_max,
										dexterity_max,
										stamina_max,
										aestheticism_max,
										reflexes_max,
										perception_max,
										charisma_max,
										intelligence_max,
										empathy_max)

								VALUES ('',
										'$name',
										'$category',
										'$vitality',
										'$speedFactor',
										'$willFactor',
										'$strengthMax',
										'$dexterityMax',
										'$staminaMax',
										'$aestheticismMax',
										'$reflexesMax',
										'$perceptionMax',
										'$charismaMax',
										'$intelligenceMax',
										'$empathyMax');";

			$result = $mysqli->query($sql);

			// Recuperation de l ID de la race nouvellement creee
			$raceId = $this->getRacesMaxId();

			// Ajout des atouts de race dans la DB
			foreach ($assetsArray as $assetArray) {
				$this->insertRaceAssets($raceId, $assetArray['id'], $assetArray['points']);
			}
		}

		// Insert une ligne dans la table assets_merge_races
		public function insertRaceAssets($raceId, $assetsId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO assets_merge_races (id, asset_id, race_id, points) VALUES ('', '$assetsId', '$raceId', '$points');";

			$result = $mysqli->query($sql);
		}

		// Insert une nouvelle skill dans la DB
		public function insertSkill($name, $skillFamilyId, $childOfId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			if($childOfId == ''){
				// Requete
				$sql = "INSERT INTO skills (id,
											name,
											family_id,
											is_child_of)

									VALUES ('',
											'$name',
											'$skillFamilyId',
											0);";
			}else{
				// Requete
				$sql = "INSERT INTO skills (id,
											name,
											family_id,
											is_child_of)

									VALUES ('',
											'$name',
											'$skillFamilyId',
											'$childOfId');";
			}

			$result = $mysqli->query($sql);
		}

		// Insert une ligne dans la table skills_merge_classes
		public function insertSkillsMergeClasses($classId, $skillId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "INSERT INTO skills_merge_classes (id,
														class_id,
														skill_id)

												VALUES ('',
														'$classId',
														'$skillId');";

			$result = $mysqli->query($sql);
		}

		// Insert un nouveau sort dans la DB
		public function insertPotion($name, $effect, $ingredients, $recipe, $difficulty, $value){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$effect = $this->formatString($effect);
			$ingredients = $this->formatString($ingredients);
			$recipe = $this->formatString($recipe);

			// Requete
			$sql = "INSERT INTO potions (id,
										name,
										effect,
										ingredients,
										recipe,
										difficulty,
										value)

								VALUES ('',
										'$name',
										'$effect',
										'$ingredients',
										'$recipe',
										'$difficulty',
										'$value');";

			$result = $mysqli->query($sql);
		}

		// Insert un nouveau sort dans la DB
		public function insertSpell($name, $effect, $typeId, $energy, $castingTime, $difficulty, $value){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$effect = $this->formatString($effect);

			// Requete
			$sql = "INSERT INTO magic_spells (id,
												name,
												effect,
												type_id,
												energy,
												casting_time,
												difficulty,
												value)

										VALUES ('',
												'$name',
												'$effect',
												'$typeId',
												'$energy',
												'$castingTime',
												'$difficulty',
												'$value');";

			$result = $mysqli->query($sql);
		}

		// Insert un personnage joueur dans la DB
		public function saveComment($forumPlaceId, $characterId, $text){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Definition de la date
			$date = date("Y-m-d H:i:s");

			// Requete
			$sql = "INSERT INTO forum_comments (id,
												forum_place_id,
												character_id,
												text,
												date)

										VALUES ('',
												'$forumPlaceId',
												'$characterId',
												'$text',
												'$date');";

			$result = $mysqli->query($sql);
		}

		// Insert une arme dans la DB
		public function insertWeapon($name, $dammage, $useStrength, $dammageType, $difficulty, $weight, $special){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$special = $this->formatString($special);

			// Requete
			$sql = "INSERT INTO weapons (id,
												name,
												dammage,
												use_strength,
												dammage_type,
												difficulty,
												weight,
												special)

										VALUES ('',
												'$name',
												'$dammage',
												'$useStrength',
												'$dammageType',
												'$difficulty',
												'$weight',
												'$special');";

			$result = $mysqli->query($sql);
		}


		/*
		*	UPDATE
		*/

		// Met a jour un atout en fonction d ID donne
		public function updateAsset($id, $name, $effect, $activation, $unitId, $value, $isOrientationAsset, $isClassAsset){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$effect = $this->formatString($effect);

			if($isOrientationAsset == TRUE){
				$isOrientationAsset = 1;
			}else{
				$isOrientationAsset = 0;
			}

			if($isClassAsset == TRUE){
				$isClassAsset = 1;
			}else{
				$isClassAsset = 0;
			}

			// Requete
			$sql = "UPDATE assets SET name = '$name', effect = '$effect', activation = '$activation', unit_id = '$unitId', value = '$value', is_orientation_asset = '$isOrientationAsset', is_class_asset = '$isClassAsset' WHERE id = '$id';";
			$result = $mysqli->query($sql);
		}

		// Met a jour un atout de niveau en fonction d un ID donne
		public function updateAssetMergeLevel($id, $level, $points, $raceId, $orientationId, $classId, $specialCondition){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$specialCondition = $this->formatString($specialCondition);

			// Requete
			$sql = "UPDATE assets_merge_levels SET level = '$level', points = '$points', race_id = '$raceId', orientation_id = '$orientationId', class_id = '$classId', special_condition = '$specialCondition' WHERE id = '$id';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l atout d un personnage en fonction des ID de ceux-ci
		public function updateChallenge($id, $mjId, $placeId, $typeId, $name, $nbrOfCharacters, $prize, $statusId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE challenges SET mj_id = '$mjId', place_id = '$placeId', type_id = '$typeId', name = '$name', nbr_of_characters = '$nbrOfCharacters', prize = '$prize', status_id = '$statusId' WHERE id = '$id';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l atout d un personnage en fonction des ID de ceux-ci
		public function updateCharacterAsset($assetId, $characterId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE assets_merge_characters SET points = '$points' WHERE asset_id = '$assetId' AND character_id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour les points d attribut d un personnage en fonction d un ID donne
		public function updateCharacterAttribute($characterId, $attributeName, $attributeValue){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET $attributeName = '$attributeValue' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour la class d un personnage en fonction d un ID donne
		public function updateCharacterClass($characterId, $classId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET class_id = '$classId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l energie max d un personnage en fonction d ID donne
		public function updateCharacterEnergyMax($characterId, $energyMaxPoints){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET energy_max = '$energyMaxPoints' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour le genre d un personnage
		public function updateCharacterGender($characterId, $genderId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET gender_id = '$genderId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour le nom d un personnage
		public function updateCharacterName($characterId, $name){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET name = '$name' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour les notes d un personnage
		public function updateCharacterNote($characterId, $note){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET note = '$note' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l orientation d un personnage
		public function updateCharacterOrientation($characterId, $orientationId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET orientation_id = '$orientationId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour la race d un personnage
		public function updateCharacterPlace($characterId, $placeId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET place_id = '$placeId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour la race d un personnage
		public function updateCharacterRace($characterId, $raceId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET race_id = '$raceId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour les points de competence d un personnage en fonction d ID donne
		public function updateCharacterSkill($characterId, $skillId, $points, $isMain){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters_merge_skills SET points = '$points', is_main = '$isMain' WHERE character_id = '$characterId' AND skill_id = '$skillId';";
					
			$result = $mysqli->query($sql);
		}

		// Met a jour le facteur de vitesse d un personnage en fonction d ID donne
		public function updateCharacterSpeedFactor($characterId, $speedFactor){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET speed_factor = '$speedFactor' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour les points de sort d un personnage en fonction d ID donnes
		public function updateCharacterSpell($characterId, $spellId, $points){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters_merge_spells SET points = '$points' WHERE character_id = '$characterId' AND spell_id = '$spellId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour le status d un personnage en fonction d un ID donne
		public function updateCharacterStatus($characterId, $statusId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET status_id = '$statusId' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour la vitalite d un personnage en fonction d ID donne
		public function updateCharacterVitality($characterId, $vitality){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET vitality = '$vitality' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour la vitalite max d un personnage en fonction d ID donne
		public function updateCharacterVitalityMax($characterId, $vitalityMax){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET vitality_max = '$vitalityMax' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour le facteur de volonte d un personnage en fonction d ID donne
		public function updateCharacterWillFactor($characterId, $willFactor){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE characters SET will_factor = '$willFactor' WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour une competence en fonction d ID donne
		public function updateClass($id, $name, $orientationId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "UPDATE classes SET name = '$name', orientation_id = '$orientationId' WHERE id = '$id';";

			$result = $mysqli->query($sql);
		}

		// Met a jour une competence en fonction d ID donne
		public function updateClassAsset($classId, $assetId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "SELECT * FROM assets_merge_classes WHERE class_id = '$classId';";
			$result = $mysqli->query($sql);

			while($row = $result->fetch_assoc()) {
				$resultArray = array('id' => $row["id"],
									'assetId' => $row["asset_id"],
									'classId' => $row["class_id"]);
			}

			// Requete
			if(count($resultArray) > 0){
				// Formatage
				$id = $resultArray['id'];

				// Update
				$sql = "UPDATE assets_merge_classes SET asset_id = '$assetId', class_id = '$classId' WHERE id = '$id';";
			}else{
				// Insert
				$sql = "INSERT INTO assets_merge_classes (id,
															asset_id,
															class_id)

													VALUES ('',
															'$assetId',
															'$classId');";
			}

			$result = $mysqli->query($sql);
		}

		// Met a jour un lieu en fonction d un ID donne
		public function updatePlace($id, $name, $isChildOf, $statusId, $isCapital){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "UPDATE places SET name = '$name', is_child_of = '$isChildOf', status_id = '$statusId', is_capital = '$isCapital' WHERE id = '$id';";

			$result = $mysqli->query($sql);
		}

		// Met a jour une race en fonction d ID donne
		public function updateRace($id, $name, $category, $vitality, $speedFactor, $willFactor, $strengthMax, $dexterityMax, $staminaMax, $charismaMax, $aestheticismMax, $empathyMax, $intelligenceMax, $perceptionMax, $reflexesMax){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			// Requete
			$sql = "UPDATE races SET name = '$name',
										category = '$category',
										vitality = '$vitality',
										speed_factor = '$speedFactor',
										will_factor = '$willFactor',
										strength_max = '$strengthMax',
										dexterity_max = '$dexterityMax',
										stamina_max = '$staminaMax',
										charisma_max = '$charismaMax',
										aestheticism_max = '$aestheticismMax',
										empathy_max = '$empathyMax',
										intelligence_max = '$intelligenceMax',
										perception_max = '$perceptionMax',
										reflexes_max = '$reflexesMax'
										WHERE id = '$id';";

			$result = $mysqli->query($sql);
		}

		// Met a jour une competence en fonction d ID donne
		public function updateSkill($id, $name, $familyId, $childOfId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);

			if($childOfId == ''){
				// Requete
				$sql = "UPDATE skills SET name = '$name', family_id = '$familyId', is_child_of = 0 WHERE id = '$id';";
			}else{
				// Requete
				$sql = "UPDATE skills SET name = '$name', family_id = '$familyId', is_child_of = '$childOfId' WHERE id = '$id';";
			}

			$result = $mysqli->query($sql);
		}

		// Met a jour un sort en fonction d ID donne
		public function updateSpell($id, $name, $effect, $typeId, $energy, $castingTime, $difficulty, $value){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Formatage de la saisie
			$name = $this->formatString($name);
			$effect = $this->formatString($effect);

			// Requete
			$sql = "UPDATE magic_spells SET name = '$name', effect = '$effect', type_id = '$typeId', energy = '$energy', casting_time = '$castingTime', difficulty = '$difficulty', value = '$value' WHERE id = '$id';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l abonnement aux alerte en cas de mise a jour du jeu
		public function updateUserGameUpdateAlert($userId, $gameUpdateAlert){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE users SET game_update_alert = '$gameUpdateAlert' WHERE id = '$userId';";
			$result = $mysqli->query($sql);
		}

		// Met a jour l abonnement aux alerte en cas de nouveau message
		public function updateUserNewCommentAlert($userId, $newCommentAlertValue){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "UPDATE users SET new_comment_alert = '$newCommentAlertValue' WHERE id = '$userId';";
			$result = $mysqli->query($sql);
		}


		/*
		*	DELETE
		*/

		// Supprime un personnage de la table characters en fonction de son ID
		public function deleteCharacter($characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM characters WHERE id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Supprime une competence pour un personnage
		public function deleteCharacterAsset($characterId, $assetId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM assets_merge_characters WHERE character_id = '$characterId' AND asset_id = '$assetId';";
			$result = $mysqli->query($sql);
		}

		// Supprime tous les atouts d un personnage en fonction de son ID
		public function deleteCharacterAssets($characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM assets_merge_characters WHERE character_id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Supprime toutes les competences d un personnage en fonction de son ID
		public function deleteCharacterSkills($characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM characters_merge_skills WHERE character_id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Supprime tous les sorts d un personnage en fonction de son ID
		public function deleteCharacterSpells($characterId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM characters_merge_spells WHERE character_id = '$characterId';";
			$result = $mysqli->query($sql);
		}

		// Supprime toutes les competences primaires pour une classe definie en fonction d un ID donne
		public function deleteClassPrimarySkills($classId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM skills_merge_classes WHERE class_id = '$classId';";
			$result = $mysqli->query($sql);
		}

		// Supprime un commentaire
		public function removeCommentById($id){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM forum_comments WHERE id = '$id';";
			$result = $mysqli->query($sql);
		}

		// Supprime une competence pour un personnage
		public function deleteCharacterSkill($characterId, $skillId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM characters_merge_skills WHERE character_id = '$characterId' AND skill_id = '$skillId';";
			$result = $mysqli->query($sql);
		}

		// Supprime un sort pour un personnage
		public function removeCharacterSpell($characterId, $spellId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM characters_merge_spells WHERE character_id = '$characterId' AND spell_id = '$spellId';";
			$result = $mysqli->query($sql);
		}

		// Supprime tous les atouts lies a une race en fonction de son ID
		public function removeRaceAssetsById($raceId){
			// Connection a la DB
			$mysqli = $this->connectDB();

			// Requete
			$sql = "DELETE FROM assets_merge_races WHERE race_id = '$raceId';";
			$result = $mysqli->query($sql);
		}
	}
?>
