<?php
	class FightMan{
		// Constructeur de la classe
		public function __construct(){
		}

		/*
		*	Publics
		*/

		// Ajoute un challenger dans une arene
		public function addChallenger($_DB, $arenaId, $characterId, $arenaStatusId){
			$_DB->insertArenaMergeCharacter($arenaId, $characterId, $arenaStatusId);
		}

		// Renvoie une Arena en fonction d un ID donne
		public function getArenaById($_DB, $id){
			return $_DB->getArenaById($id);
		}

		// Renvoie une Array contenant tout les personnages dispo pour entrer dans l arene
		public function getMyCharactersAvailable($_DB, $userId, $arenaId){
			$MyCharactersArray = $_DB->getCharactersArrayByUserId($userId);

			$CharactersAvailableArray = array();

			// Filtre des personnage non selectionnable
			foreach ($MyCharactersArray as $Character) {
				if($Character->status['id'] != 5 &&		// Supression des MJ
					$Character->status['id'] != 3		// Supression des persos inactifs
				){
					array_push($CharactersAvailableArray, $Character);
				}
			}

			return $CharactersAvailableArray;
		}
	}
?>
