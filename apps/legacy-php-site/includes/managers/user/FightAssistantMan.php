<?php
	class FightAssistantMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Cree et ajoute des PNJ a l Array contenant les PNJ
		public function addNpc($_DB, $nbrOfNewNpc, $id, $NpcAvailableArray, $nbrOfCurrentNpc){
			// Recuperation des donnees du PNJ choisi
			foreach ($NpcAvailableArray as $currentNpc) {
				if($id == $currentNpc['id']){
					$npcData = $currentNpc;
					break;
				}
			}

			// Recuperation des data de la race du PNJ
			$race = $_DB->getRaceById($npcData['raceId']);

			// Recuperation des data de la classe du PNJ
			$class = $_DB->getClassById($npcData['classId']);

			// Recuperation des data de la competence primaire
			$mainSkill = $_DB->getMainSkillById($npcData['mainSkillId']);

			$NpcArray = array();

			$i = 1;

			while ($i <= $nbrOfNewNpc){
				// Definition du nom du Npc
				$number = $i + $nbrOfCurrentNpc;
				$npcName = $number . ' ' . $class['name'] . ' ' . $race['name'];

				// Creation de l objet Npc
				$Npc = new Npc($npcName, $class, $race, $mainSkill);

				// Ajout de l attribut nextTurn
				$Npc->nextTurn = 0;

				// Ajout du PNJ a l array des PNJ
				array_push($NpcArray, $Npc);

				$i++;
			}

			return $NpcArray;
		}

		// Renvoi le prochain DT
		public function getNextTD($TD, $nextTD){
			switch ($nextTD) {
				case '+':
					$TD++;

					if($TD > 50){
						$TD = 1;
					}
					break;

				case '-':
					$TD--;

					if($TD < 1){
						$TD = 50;
					}

				default:
					break;
			}

			return $TD;
		}

		// Renvoi la liste des PNJ commun (id + name)
		public function getAllNpc($_DB){
			$NpcArray = $_DB->getAllNpc();

			$finalArray = array();

			foreach ($NpcArray as $npc) {
				// Recuperation des data de la race du PNJ
				$race = $_DB->getRaceById($npc['raceId']);

				// Recuperation des data de la classe du PNJ
				$class = $_DB->getClassById($npc['classId']);

				$npc['name'] = $class['name'] . ' ' . $race['name'];

				array_push($finalArray, $npc);
			}

			return $finalArray;
		}

		// Modifie un PNJ
		public function modifyNpc($NpcArray, $TD, $npcName, $modifiedCharacterElement, $modification){
			foreach ($NpcArray as $Npc) {
				if($Npc->name == $npcName){
					switch ($modifiedCharacterElement) {
						// Modification de la vitalite
						case 'vitality':
							// Definition de la limite en dessous de laquelle le PNJ a des malus
							if($Npc->raceId != 30 && $Npc->raceId != 31){ // Si le NPC n est pas un squelette (atout: Jusqu a la mort)
								$limit = round($Npc->vitalityMax / 2, 0, PHP_ROUND_HALF_UP);
							}else{
								$limit = 0;
							}

							// Calcul du malus courant
							if($Npc->vitality < $limit){			// Et qu'il ne s agit pas d un squelette (Atout: jusqu a la mort)
								$malus = $limit - $Npc->vitality;
							}else{
								$malus = 0;
							}

							$Npc->vitality = $Npc->vitality + $modification;

							// Recuperation de la vitalite entre 0 et le max
							if($Npc->vitality > $Npc->vitalityMax){
								$Npc->vitality = $Npc->vitalityMax;
							}elseif($Npc->vitality < 0){
								$Npc->vitality = 0;
							}

							// Calcul du nouveau malus
							if($Npc->vitality < $limit){
								$newMalus = $limit - $Npc->vitality;
							}else{
								$newMalus = 0;
							}

							// Ajout des malus
							if($newMalus > $malus){
								$newMalus = $newMalus - $malus;

								$Npc->strength = $Npc->strength - $newMalus;

								if($Npc->strength < 0){
									$Npc->strength = 0;
								}

								$Npc->dexterity = $Npc->dexterity - $newMalus;

								if($Npc->dexterity < 0){
									$Npc->dexterity = 0;
								}

								$Npc->stamina = $Npc->stamina - $newMalus;

								if($Npc->stamina < 0){
									$Npc->stamina = 0;
								}
							}elseif($newMalus < $malus){
								$newMalus =  $malus - $newMalus;

								$Npc->strength = $Npc->strength + $newMalus;

								$Npc->dexterity = $Npc->dexterity + $newMalus;

								$Npc->stamina = $Npc->stamina + $newMalus;
							}

							// Ajout de malus dur le DT d action en cas de points de degats
							if($modification < 0){
								$Npc->nextTurn = $Npc->nextTurn + abs($modification);
							}

							break;

						case 'speedFactor':
							$lastTurn = $Npc->nextTurn - $Npc->speedFactor;

							$Npc->speedFactor = $Npc->speedFactor + $modification;

							break;

						case 'nextTurn':
							$Npc->nextTurn = $Npc->nextTurn + $modification;

							break;

						default:
							break;
					}
				}
			}
		}

		// Met a jour les des prochains tours des PNJ
		public function updateNpcNextTurn($NpcArray, $TD, $nextTD){
			foreach ($NpcArray as $Npc) {
				switch ($nextTD) {
					// mise a jour du prochain tour du PNJ si on avance dans les DT
					case '+':
						if($Npc->nextTurn < $TD){
							$Npc->nextTurn = $Npc->nextTurn + $Npc->speedFactor;
						}

						// Restart de 50 a 1 DT
						if($Npc->nextTurn > 50){
							$Npc->nextTurn = $Npc->nextTurn - 50;
						}

						if($Npc->nextTurn == 50 && $TD == 1){
							$Npc->nextTurn = $Npc->speedFactor;
						}
						break;

					// mise a jour du prochain tour du PNJ si on recule dans les DT
					case '-':
						$temp = $Npc->nextTurn - $Npc->speedFactor;

						if($temp <= 0){
							$temp = $temp + 50;
						}

						if($TD == $temp){
							$Npc->nextTurn = $Npc->nextTurn - $Npc->speedFactor;

							if($Npc->nextTurn <= 0){
								$Npc->nextTurn = $Npc->nextTurn + 50;
							}
						}
						break;

					// Dans le cas ou le DT n a pas change
					case '':
						// Set du premier tour d'action du PNJ
						if($Npc->nextTurn == 0){
							$Npc->nextTurn = $TD + $Npc->speedFactor;
						}

						// Restart de 50 a 1 DT
						if($Npc->nextTurn > 50){
							$Npc->nextTurn = $Npc->nextTurn - 50;
						}

						if($Npc->nextTurn == 50 && $TD == 1){
							$Npc->nextTurn = $Npc->speedFactor;
						}

						break;

					default:
						break;
				}
			}

			return $NpcArray;
		}

		// Lance les des pour les PNJ
		public function rollNpcDices($NpcArray, $TD, $_Dice){
			foreach ($NpcArray as $Npc) {
				// Lancement de des des PNJ
				if($Npc->nextTurn == $TD){

					$rollArray = array();

					$rollArray['attributName'] = 'Dextérité';
					$rollArray['attributPoints'] = $Npc->dexterity;

					// Boucle dans les competences pour y trouver la principale
					foreach ($Npc->skills as $skill) {
						if($skill['id'] == $Npc->mainSkillId){
							$mainSkillPoints = $skill['points'];

							$rollArray['skillName'] = $skill['name'];
							$rollArray['skillPoints'] = $skill['points'];
						}
					}

					$nbrOfDices = $mainSkillPoints + $Npc->dexterity;

					$difficulty = 6;

					$rollArray['difficulty'] = $difficulty;

					$dicesArray = $_Dice->rollD10($nbrOfDices, $difficulty);

					$rollArray['nbrOfSuccess'] = $dicesArray['0']['nbrOfSuccess'];

					$Npc->roll = $rollArray;
				}
			}

			return $NpcArray;
		}

		// Fait un jet d endurance et deduit eventuellement les point de vie
		public function staminaRoll($NpcArray, $npcName, $TD, $damage, $_Dice){
			foreach ($NpcArray as $Npc) {
				if($Npc->name == $npcName){
					// Definition des infos du jet
					$rollArray = array();
					$rollArray['attributName'] = 'Endurance';
					$rollArray['attributPoints'] = $Npc->stamina;
					$rollArray['difficulty'] = 7;

					$dicesArray = $_Dice->rollD10($Npc->stamina, 7);

					$rollArray['nbrOfSuccess'] = $dicesArray['0']['nbrOfSuccess'];

					// Gestion des echecs critique
					if(!is_numeric($dicesArray['0']['nbrOfSuccess'])) {
				        $dicesArray['0']['nbrOfSuccess'] = 0;
				    }

					$finalDamages = $damage - $dicesArray['0']['nbrOfSuccess'];

					// Suppression des points de vies
					if($finalDamages > 0){
						$finalDamages = -1 * $finalDamages;

						$this->modifyNpc($NpcArray, $TD, $npcName, 'vitality', $finalDamages);
					}



					$Npc->roll = $rollArray;
				}
			}

			return $NpcArray;
		}
	}
?>
