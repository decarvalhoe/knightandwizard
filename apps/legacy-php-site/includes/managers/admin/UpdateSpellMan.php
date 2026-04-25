<?php
	class UpdateSpellMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoi une Array contenant un sort en fonction d un ID donne
		public function getSpellById($_DB, $id){
			$spellArray = $_DB->getSpellById($id);

			return $spellArray;
		}

		// Met a jour un sort
		public function updateSpell($_DB, $id, $name, $effect, $typeId, $value){
			// Definition de l'angle du triangle rectangle
			switch ($typeId) {
				case '1':
					$phi = 0.7;
					break;

				case '2':
					$phi = 1.5;
					break;

				case '3':
					$phi = 1.1;
					break;

				case '4':
					$phi = 1.7;
					break;

				case '5':
					$phi = 0.8;
					break;

				case '6':
					$phi = 1;
					break;

				case '7':
					$phi = 1.3;
					break;

				case '8':
					$phi = 1.4;
					break;

				case '9':
					$phi = 1.2;
					break;

				case '10':
					$phi = 1.6;
					break;

				case '11':
					$phi = 0.9;
					break;
			}

			$temp = (2 * $value) / $phi;
			$energy = sqrt ($temp);
			$castingTime = $phi * $energy;
			$temp2 = pow($castingTime, 2);
			$temp3 = $temp + $temp2;
			$temp4 = sqrt ($temp3);
			$temp5 = sqrt ($temp4);

			$difficulty = round(2 * $temp5);
			$energy = round($energy);
			$castingTime = round($castingTime);

			$_DB->updateSpell($id, $name, $effect, $typeId, $energy, $castingTime, $difficulty, $value);
		}
	}
?>
