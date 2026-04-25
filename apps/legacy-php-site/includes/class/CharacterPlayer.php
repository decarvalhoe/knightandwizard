<?php
	class CharacterPlayer extends Character{
		public $id;
		public $userId;
		public $profilImg;
		public $place;
		public $note;

        //Constructeur de la classe
        public function __construct($_DB, $array) {
			$this->id = $array['id'];
			$this->userId = $array['userId'];
			$this->setProfilImg($array['id']);
			$this->gender = $_DB->getGenderById($array['genderId']);
			$this->race = $_DB->getRaceById($array['raceId']);
			$this->orientation = $_DB->getOrientationById($array['orientationId']);
			$this->class = $_DB->getClassById($array["classId"]);
			$this->name = $array['name'];
			$this->vitality = $array['vitality'];
			$this->vitalityMax = $array['vitalityMax'];
			$this->speedFactor = $array['speedFactor'];
			$this->willFactor = $array['willFactor'];
			$this->energy = $array['energy'];
			$this->energyMax = $array['energyMax'];
			$this->strength = $array['strength'];
			$this->dexterity = $array['dexterity'];
			$this->stamina = $array['stamina'];
			$this->aestheticism = $array['aestheticism'];
			$this->charisma = $array['charisma'];
			$this->empathy = $array['empathy'];
			$this->intelligence = $array['intelligence'];
			$this->perception = $array['perception'];
			$this->reflexes = $array['reflexes'];
			$this->skills = $array['skills'];
			$this->assets = $array['assets'];
			$this->place = $_DB->getPlaceById($array['placeId']);
			$this->status = $_DB->getStatusById($array['statusId']);
			$this->note = $array['note'];
        }

		/*
		* Setters
		*/

		// Set l image de profil du personnage
		private function setProfilImg($id){
			$file = '../' . P_DIR_IMG_CHAR_PROFIL . $id . '.jpg';

			if (file_exists($file)) {
			    $this->profilImg = $file;
			} else {
				$this->profilImg = '../' . P_DIR_IMG_CHAR_PROFIL . 'no-img.jpg';
			}
		}

		/*
		* Getters
		*/

		// Calcul du niveau du personnage
		public function getMyLevel(){
			// Si le personnage a une race attribuee ET que cette race n est pas "Familier" (id = 32).
			if(isset($this->race) && $this->race['id'] != 32){
				// Definition du niveau du personnage
				$this->level = 0;
				$this->levelPoints = 0;
				$levelUpAt = $this->race['category'];

				if($this->orientation['id'] != 1){	// Si le personnage n'est pas un magicien...
					foreach ($this->skills as $skill) {
						$this->levelPoints = $this->levelPoints + $skill['points'];

						// Point compte double pour les competences primaires
						if($skill['isMain'] == 1){
							$this->levelPoints = $this->levelPoints + $skill['points'];

							$primarySkillId = $skill['id'];
						}

						// Passage au niveau superieur
						if($this->levelPoints >= $levelUpAt){
							do {
								$this->level++;
								$levelUpAt = $levelUpAt + $this->race['category'];
							} while ($this->levelPoints >= $levelUpAt);
						}
					}

					// Ajout des specialisations de comp. primaire en comp. primaires
					if(isset($primarySkillId)){
						$specialisationsIdArray = array();

						$i = 0;

						foreach ($this->skills as $skill) {
							if($skill['isChildOf'] == $primarySkillId){
								$this->levelPoints = $this->levelPoints + $skill['points'];

								$this->skills[$i]['isMain'] = 1;

								array_push($specialisationsIdArray, $skill['id']);
							}

							// Passage au niveau superieur
							if($this->levelPoints >= $levelUpAt){
								do {
									$this->level++;
									$levelUpAt = $levelUpAt + $this->race['category'];
								} while ($this->levelPoints >= $levelUpAt);
							}

							$i++;
						}

						// Ajout des spec. de spec. de comp. primaire en comp. primaires
						if(count($specialisationsIdArray) > 0){
							$newSpecialisationsIdArray = $specialisationsIdArray;

							do {
								$specialisationsIdArray = $newSpecialisationsIdArray;
								$newSpecialisationsIdArray = array();

								$k = 0;

								foreach ($specialisationsIdArray as $specialisationsId) {
									$i = 0;

									foreach ($this->skills as $skill) {
										if($skill['isChildOf'] == $specialisationsId){
											$this->levelPoints = $this->levelPoints + $skill['points'];

											$this->skills[$i]['isMain'] = 1;

											array_push($newSpecialisationsIdArray, $skill['id']);
										}

										// Passage au niveau superieur
										if($this->levelPoints >= $levelUpAt){
											do {
												$this->level++;
												$levelUpAt = $levelUpAt + $this->race['category'];
											} while ($this->levelPoints >= $levelUpAt);
										}

										$i++;
									}

									$k++;
								}
							} while (count($newSpecialisationsIdArray) > $k);
						}
					}
				}else{									// Si le personnage est un magicien...
					// Ajout des points lies aux competences
					foreach ($this->skills as $skill) {
						$this->levelPoints = $this->levelPoints + $skill['points'];

						// Passage au niveau superieur
						if($this->levelPoints >= $levelUpAt){
							do {
								$this->level++;
								$levelUpAt = $levelUpAt + $this->race['category'];
							} while ($this->levelPoints >= $levelUpAt);
						}
					}

					// Ajout des points lies aux sorts
					foreach ($this->spells as $spell){
						// Points de sort compte double
						$this->levelPoints = $this->levelPoints + (2 * $spell['points']);

						// Passage au niveau superieur
						if($this->levelPoints >= $levelUpAt){
							do {
								$this->level++;
								$levelUpAt = $levelUpAt + $this->race['category'];
							} while ($this->levelPoints >= $levelUpAt);
						}
					}
				}

				$this->levelUpAt = $levelUpAt;
			}else{
				// Definition du niveau du personnage
				$this->level = 'NA';
				$this->levelPoints = 'NA';
				$this->levelUpAt = 'NA';
			}
		}
    }
?>
