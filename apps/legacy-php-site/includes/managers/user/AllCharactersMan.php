<?php
	class AllCharactersMan{
		// Constructeur de la classe
		public function __construct(){
		}

		// Renvoit une Array contenant tout les personnage actifs
		public function getActivesCharacters($_DB){
			// Recuperation de tout les PJ
			$array1 = $_DB->getCharactersByStatusId(1);

			// Recuperation de tout les PNJ actifs
			$array2 = $_DB->getCharactersByStatusId(2);

			// Merge des 2 arrays
			$CharactersArray = array_merge($array1, $array2);

			// Tri des personnages par nom
			$i = 0;

			foreach ($CharactersArray as $Character){
				// Ajout du personnage a l Array mais avec le nom en index
				$CharactersArray[$Character->name] = $Character;

				// Suppression du persaonnage ayant un numero comme index
				unset($CharactersArray[$i]);

				$i++;
			}

			// Tri de l Array en fonction de l index (soit du nom des personnage)
			ksort($CharactersArray);

			// Re-passage de l array avec des index numeriques
			$NewCharactersArray = array();

			foreach ($CharactersArray as $Character){
				array_push($NewCharactersArray, $Character);
			}

			return $NewCharactersArray;
		}
	}
?>
